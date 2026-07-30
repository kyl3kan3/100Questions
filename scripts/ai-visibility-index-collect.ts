import { createHash } from "node:crypto";
import {
  access,
  mkdir,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises";
import { dirname, join } from "node:path";

import {
  classifyProviderError,
  providerErrorDiagnostic,
  queryGroundedProvider,
  type NormalizedProviderAnswer,
} from "@/lib/ai/providers";
import type { ProviderKey } from "@/lib/ai/models";

type Protocol = {
  studyId: string;
  status: string;
  registeredAt: string;
  market: string;
  locale: string;
  questionSet: {
    sha256: string;
    rankingQuestionCount: number;
  };
  cohort: {
    sha256: string;
    brandCount: number;
  };
  collection: {
    plannedAnswerCount: number;
    models: Record<ProviderKey, string>;
  };
};

type Question = {
  question_id: string;
  cohort: string;
  question_text: string;
  used_for_ranking: string;
};

type SuccessfulAttempt = {
  status: "completed";
  questionId: string;
  question: string;
  provider: ProviderKey;
  startedAt: string;
  completedAt: string;
  answer: NormalizedProviderAnswer;
};

type FailedAttempt = {
  status: "failed";
  questionId: string;
  question: string;
  provider: ProviderKey;
  model: string;
  startedAt: string;
  completedAt: string;
  error: ReturnType<typeof classifyProviderError>;
  diagnostic: ReturnType<typeof providerErrorDiagnostic>;
};

type Attempt = SuccessfulAttempt | FailedAttempt;

type CollectionFile = {
  studyId: string;
  protocolSha256: string;
  questionSetSha256: string;
  cohortSha256: string;
  startedAt: string;
  completedAt: string | null;
  attempts: Attempt[];
};

const providers: ProviderKey[] = ["openai", "anthropic", "google", "xai"];
const root = process.cwd();
const protocolPath = join(
  root,
  "public",
  "data",
  "ai-visibility-index-2026-protocol.json",
);
const questionPath = join(
  root,
  "public",
  "data",
  "ai-visibility-index-2026-question-set.csv",
);
const cohortPath = join(
  root,
  "public",
  "data",
  "ai-visibility-index-2026-cohort.csv",
);
const outputPath = join(
  root,
  "research",
  "ai-visibility-index",
  "2026",
  "raw",
  "answers.json",
);

async function main() {
  const argumentsSet = new Set(process.argv.slice(2));
  const smoke = argumentsSet.has("--smoke");
  const confirmed = argumentsSet.has("--confirm-live-collection");
  const resume = argumentsSet.has("--resume");

  requireGatewayAuthentication();

  const protocolText = await readFile(protocolPath, "utf8");
  const protocol = JSON.parse(protocolText) as Protocol;
  const questionText = await readFile(questionPath, "utf8");
  const cohortText = await readFile(cohortPath, "utf8");
  verifyProtocol(protocol, protocolText, questionText, cohortText);

  if (smoke) {
    await runSmokeTest(protocol);
    return;
  }

  if (!confirmed) {
    throw new Error(
      "Refusing live collection without --confirm-live-collection.",
    );
  }

  const questions = parseCsv(questionText)
    .map((row) => row as Question)
    .filter(
      (question) =>
        question.cohort === "discovery" &&
        question.used_for_ranking === "yes",
    );

  if (questions.length !== protocol.questionSet.rankingQuestionCount) {
    throw new Error("The registered discovery-question count does not match.");
  }

  const collection = await loadOrCreateCollection(protocol, protocolText, resume);
  const attemptedKeys = new Set(
    collection.attempts.map(
      (attempt) => `${attempt.questionId}:${attempt.provider}`,
    ),
  );

  for (const [questionIndex, question] of questions.entries()) {
    const pendingProviders = providers.filter(
      (provider) =>
        !attemptedKeys.has(`${question.question_id}:${provider}`),
    );

    if (pendingProviders.length === 0) {
      continue;
    }

    const attempts = await Promise.all(
      pendingProviders.map((provider) =>
        collectAttempt(protocol, question, provider),
      ),
    );
    collection.attempts.push(...attempts);
    await saveCollection(collection);

    const grounded = attempts.filter(
      (attempt) =>
        attempt.status === "completed" &&
        attempt.answer.groundingStatus === "grounded",
    ).length;
    const totalCostMicros = attempts.reduce(
      (total, attempt) =>
        total +
        (attempt.status === "completed" ? attempt.answer.costMicros : 0),
      0,
    );
    console.log(
      `Question ${questionIndex + 1}/${questions.length}: ${grounded}/${attempts.length} grounded; batch cost ${formatMicros(totalCostMicros)}.`,
    );
  }

  if (collection.attempts.length !== protocol.collection.plannedAnswerCount) {
    throw new Error(
      `Collection stopped with ${collection.attempts.length}/${protocol.collection.plannedAnswerCount} recorded attempts.`,
    );
  }

  collection.completedAt = new Date().toISOString();
  await saveCollection(collection);

  const completed = collection.attempts.filter(
    (attempt) => attempt.status === "completed",
  );
  const grounded = completed.filter(
    (attempt) => attempt.answer.groundingStatus === "grounded",
  );
  const totalCostMicros = completed.reduce(
    (total, attempt) => total + attempt.answer.costMicros,
    0,
  );

  console.log(
    `Collection complete: ${grounded.length}/${collection.attempts.length} eligible grounded answers; recorded cost ${formatMicros(totalCostMicros)}.`,
  );
}

async function runSmokeTest(protocol: Protocol) {
  const question =
    "What should a marketing team look for when choosing software to measure brand visibility in AI-generated answers?";
  const results = await Promise.all(
    providers.map(async (provider) => {
      const startedAt = new Date().toISOString();
      try {
        const answer = await queryGroundedProvider({
          provider,
          model: protocol.collection.models[provider],
          question,
          cohort: "discovery",
          market: protocol.market,
          locale: protocol.locale,
          gatewayUserId: "public-index-2026-smoke",
          runId: `${protocol.studyId}-smoke`,
          promptVersion: "index-provider-v1",
        });
        return {
          provider,
          startedAt,
          status: "completed",
          groundingStatus: answer.groundingStatus,
          sourceCount: answer.sources.length,
          cost: formatMicros(answer.costMicros),
        };
      } catch (error) {
        return {
          provider,
          startedAt,
          status: "failed",
          error: classifyProviderError(error),
          diagnostic: providerErrorDiagnostic(error),
        };
      }
    }),
  );

  console.log(JSON.stringify(results, null, 2));
}

async function collectAttempt(
  protocol: Protocol,
  question: Question,
  provider: ProviderKey,
): Promise<Attempt> {
  const startedAt = new Date().toISOString();
  const model = protocol.collection.models[provider];

  try {
    const answer = await queryGroundedProvider({
      provider,
      model,
      question: question.question_text,
      cohort: "discovery",
      market: protocol.market,
      locale: protocol.locale,
      gatewayUserId: "public-index-2026",
      runId: protocol.studyId,
      promptVersion: "index-provider-v1",
    });

    return {
      status: "completed",
      questionId: question.question_id,
      question: question.question_text,
      provider,
      startedAt,
      completedAt: new Date().toISOString(),
      answer,
    };
  } catch (error) {
    return {
      status: "failed",
      questionId: question.question_id,
      question: question.question_text,
      provider,
      model,
      startedAt,
      completedAt: new Date().toISOString(),
      error: classifyProviderError(error),
      diagnostic: providerErrorDiagnostic(error),
    };
  }
}

async function loadOrCreateCollection(
  protocol: Protocol,
  protocolText: string,
  resume: boolean,
): Promise<CollectionFile> {
  const exists = await fileExists(outputPath);

  if (exists && !resume) {
    throw new Error(
      "A raw collection already exists. Use --resume only after an interrupted process.",
    );
  }

  if (exists) {
    const collection = JSON.parse(
      await readFile(outputPath, "utf8"),
    ) as CollectionFile;

    if (
      collection.studyId !== protocol.studyId ||
      collection.protocolSha256 !== sha256(protocolText)
    ) {
      throw new Error("The existing raw collection does not match this protocol.");
    }

    if (collection.completedAt) {
      throw new Error("The registered collection is already complete.");
    }

    return collection;
  }

  return {
    studyId: protocol.studyId,
    protocolSha256: sha256(protocolText),
    questionSetSha256: protocol.questionSet.sha256,
    cohortSha256: protocol.cohort.sha256,
    startedAt: new Date().toISOString(),
    completedAt: null,
    attempts: [],
  };
}

async function saveCollection(collection: CollectionFile) {
  await mkdir(dirname(outputPath), { recursive: true });
  const temporaryPath = `${outputPath}.tmp`;
  await writeFile(
    temporaryPath,
    `${JSON.stringify(collection, null, 2)}\n`,
    "utf8",
  );
  await rename(temporaryPath, outputPath);
}

function verifyProtocol(
  protocol: Protocol,
  protocolText: string,
  questionText: string,
  cohortText: string,
) {
  if (protocol.status !== "registered") {
    throw new Error("The study protocol is not registered.");
  }

  if (Date.parse(protocol.registeredAt) >= Date.now()) {
    throw new Error("The protocol registration timestamp is not in the past.");
  }

  if (sha256CanonicalText(questionText) !== protocol.questionSet.sha256) {
    throw new Error("The question-set hash does not match the protocol.");
  }

  if (sha256CanonicalText(cohortText) !== protocol.cohort.sha256) {
    throw new Error("The cohort hash does not match the protocol.");
  }

  if (parseCsv(cohortText).length !== protocol.cohort.brandCount) {
    throw new Error("The registered cohort count does not match.");
  }

  if (protocol.collection.plannedAnswerCount !== 80) {
    throw new Error("The registered planned-answer count is not 80.");
  }

  for (const provider of providers) {
    if (!protocol.collection.models[provider]?.startsWith(`${provider}/`)) {
      throw new Error(`The registered ${provider} model is invalid.`);
    }
  }

  if (!sha256(protocolText)) {
    throw new Error("The protocol could not be hashed.");
  }
}

function requireGatewayAuthentication() {
  if (!process.env.VERCEL_OIDC_TOKEN && !process.env.AI_GATEWAY_API_KEY) {
    throw new Error(
      "AI Gateway authentication is not available in the process environment.",
    );
  }
}

function parseCsv(input: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const next = input[index + 1];

    if (character === '"') {
      if (quoted && next === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...data] = rows;
  if (!header) return [];

  return data.map((values) =>
    Object.fromEntries(
      header.map((name, index) => [name, values[index] ?? ""]),
    ),
  );
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function sha256CanonicalText(value: string): string {
  return sha256(value.replace(/\r\n?/gu, "\n"));
}

function formatMicros(micros: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(micros / 1_000_000);
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Collection failed.");
  process.exitCode = 1;
});
