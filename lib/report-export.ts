import fontkit from "@pdf-lib/fontkit";
import bidiFactory from "bidi-js";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import decompressWoff2 from "wawoff2/decompress";

type ExportPayload = NonNullable<Awaited<ReturnType<typeof import("@/lib/runs").getRunResultsForUser>>>;
type ExportResult = ExportPayload["rows"][number]["result"];

type FontAsset = {
  bytes: Uint8Array;
  characters: ReadonlySet<number>;
};

type EmbeddedFont = FontAsset & {
  font: PDFFont;
};

type PdfFonts = {
  regular: EmbeddedFont[];
  bold: EmbeddedFont[];
};

type IndexedRun = {
  start: number;
  end: number;
};

type FontRun = IndexedRun & {
  text: string;
  font: PDFFont;
  level: number;
};

const bidi = bidiFactory();
const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const REPLACEMENT_GLYPHS = ["\u25A1", "\uFFFD", "?"] as const;

let fontAssetsPromise: Promise<{ regular: FontAsset[]; bold: FontAsset[] }> | undefined;
let fontDecompressionQueue: Promise<void> = Promise.resolve();

export function buildResultsCsv(payload: ExportPayload) {
  const header = [
    "Question", "Cohort", "Category", "Provider", "Status", "Grounding", "Score eligible",
    "Brand mentioned", "Prominence", "Sentiment", "Owned domain cited", "Competitors mentioned",
    "Source URLs", "Answer",
  ];
  const records = payload.rows.map(({ question, job, result }) => {
    const analysisAvailable = hasCompletedAnalysis(result);
    return [
      question.text,
      question.cohort,
      question.category,
      job?.provider ?? "",
      job?.status ?? "pending",
      result?.groundingStatus ?? "",
      analysisAvailable ? result.scoreEligible : "",
      analysisAvailable ? result.targetMentioned : "",
      analysisAvailable ? result.prominence : "",
      analysisAvailable ? (result.sentiment ?? "") : "",
      analysisAvailable ? result.ownedDomainCited : "",
      analysisAvailable ? result.competitorMentions.map((item) => item.name).join(" | ") : "",
      result?.sources.map((source) => source.url).join(" | ") ?? "",
      result?.answerText ?? job?.errorMessage ?? "",
    ];
  });

  return [header, ...records].map((record) => record.map(csvCell).join(",")).join("\r\n");
}

export async function buildResultsPdf(payload: ExportPayload) {
  const document = await PDFDocument.create();
  const fonts = await embedPdfFonts(document);
  let page = document.addPage([612, 792]);
  let y = 742;

  const write = (text: string, options: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; gap?: number } = {}) => {
    const size = options.size ?? 9;
    const fontCandidates = options.bold ? fonts.bold : fonts.regular;
    const lines = wrapPdfText(normalizePdfText(text), fontCandidates, size, 520);
    for (const line of lines) {
      if (y < 54) {
        page = document.addPage([612, 792]);
        y = 742;
      }
      drawPdfText(page, line, fontCandidates, 46, y, size, options.color ?? rgb(0.16, 0.18, 0.17), 520);
      y -= size + 4;
    }
    y -= options.gap ?? 5;
  };

  write("100 Questions", { bold: true, size: 10, color: rgb(0.06, 0.55, 0.36), gap: 8 });
  write(`${payload.run.subjectName} - AI visibility audit`, { bold: true, size: 22, gap: 10 });
  write(`Web-grounded model benchmark | ${payload.run.questionCountPlanned} questions | ${payload.run.providerCallsPlanned} planned answers`, { size: 10, color: rgb(0.35, 0.37, 0.36), gap: 18 });

  write("What to do next", { bold: true, size: 15, gap: 8 });
  if (payload.actionPlan.length === 0) write("No evidence-backed recommendations were available for this run.");
  for (const item of payload.actionPlan) {
    write(`${item.rank}. ${item.title}`, { bold: true, size: 11, gap: 2 });
    write(item.action, { size: 9, gap: 2 });
    write(`Why: ${item.rationale} | Confidence: ${item.confidence}`, { size: 8, color: rgb(0.38, 0.4, 0.39), gap: 8 });
  }

  write("Answer evidence", { bold: true, size: 15, gap: 8 });
  for (const row of payload.rows) {
    if (!row.job) continue;
    const result = row.result;
    let eligibility = "analysis unavailable";
    let mention = "brand mention unavailable";
    if (hasCompletedAnalysis(result)) {
      eligibility = result.scoreEligible ? "grounded and eligible" : result.groundingStatus;
      mention = result.targetMentioned ? "brand mentioned" : "brand not mentioned";
    }
    write(`${row.question.sortOrder}. ${row.question.text}`, { bold: true, size: 10, gap: 2 });
    write(`${row.job.provider.toUpperCase()} | ${eligibility} | ${mention}`, { size: 8, color: rgb(0.28, 0.31, 0.3), gap: 2 });
    if (row.result?.answerText) write(row.result.answerText, { size: 8, gap: 2 });
    const sources = row.result?.sources.map((source) => source.url).join(" | ");
    if (sources) write(`Sources: ${sources}`, { size: 7, color: rgb(0.2, 0.42, 0.34), gap: 10 });
  }

  addFooters(document.getPages(), fonts.regular[0].font);
  document.setTitle(`${payload.run.subjectName} AI visibility audit`);
  document.setAuthor("100 Questions");
  document.setSubject("Web-grounded model benchmark and action plan");
  return document.save();
}

function hasCompletedAnalysis(result: ExportResult): result is NonNullable<ExportResult> {
  return Boolean(
    result
    && result.analysisVersion !== "__pending__"
    && result.exclusionReason !== "analysis_pending"
    && result.exclusionReason !== "analysis_failed",
  );
}

function csvCell(value: unknown) {
  const rawText = String(value ?? "");
  const text = /^[\u0000-\u0020]*[=+\-@]/u.test(rawText) ? `'${rawText}` : rawText;
  return /[",\r\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function normalizePdfText(value: string) {
  return value.normalize("NFC").replace(/\s+/gu, " ").trim();
}

/**
 * Returns runs in visual left-to-right order while leaving the text inside each
 * run in logical order so fontkit can apply Arabic shaping and RTL glyph layout.
 */
export function getBidiVisualTextRuns(text: string) {
  if (!text) return [];
  const embedding = bidi.getEmbeddingLevels(text);
  const logicalRuns: Array<IndexedRun & { text: string; level: number }> = [];

  for (const { segment, index } of graphemeSegmenter.segment(text)) {
    const level = embedding.levels[index] ?? embedding.paragraphs[0]?.level ?? 0;
    const previous = logicalRuns.at(-1);
    if (previous?.level === level && previous.end + 1 === index) {
      previous.text += segment;
      previous.end = index + segment.length - 1;
    } else {
      logicalRuns.push({
        text: segment,
        level,
        start: index,
        end: index + segment.length - 1,
      });
    }
  }

  return orderRunsVisually(text, embedding, logicalRuns).map(({ text: runText, level }) => ({
    text: runText,
    direction: level % 2 === 0 ? "ltr" as const : "rtl" as const,
  }));
}

async function embedPdfFonts(document: PDFDocument): Promise<PdfFonts> {
  document.registerFontkit(fontkit);
  const assets = await loadFontAssets();
  const embed = async ({ bytes, characters }: FontAsset): Promise<EmbeddedFont> => ({
    bytes,
    characters,
    font: await document.embedFont(bytes, { subset: true }),
  });

  return {
    regular: await Promise.all(assets.regular.map(embed)),
    bold: await Promise.all(assets.bold.map(embed)),
  };
}

function loadFontAssets() {
  if (!fontAssetsPromise) {
    const fontPaths = resolveFontPaths();
    fontAssetsPromise = Promise.all([
      Promise.all(fontPaths.regular.map(loadFontAsset)),
      Promise.all(fontPaths.bold.map(loadFontAsset)),
    ]).then(([regular, bold]) => ({ regular, bold }));
  }
  return fontAssetsPromise;
}

function resolveFontPaths() {
  const require = createRequire(import.meta.url);
  return {
    regular: [
      require.resolve("@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-400-normal.woff2"),
      require.resolve("@fontsource/noto-sans-arabic/files/noto-sans-arabic-arabic-400-normal.woff2"),
      require.resolve("@fontsource/noto-emoji/files/noto-emoji-emoji-400-normal.woff2"),
      require.resolve("@fontsource/unifont/files/unifont-latin-400-normal.woff2"),
    ],
    bold: [
      require.resolve("@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-700-normal.woff2"),
      require.resolve("@fontsource/noto-sans-arabic/files/noto-sans-arabic-arabic-700-normal.woff2"),
      require.resolve("@fontsource/noto-emoji/files/noto-emoji-emoji-700-normal.woff2"),
      require.resolve("@fontsource/unifont/files/unifont-latin-400-normal.woff2"),
    ],
  } as const;
}

async function loadFontAsset(path: string): Promise<FontAsset> {
  // pdf-lib/fontkit can inspect WOFF2 files, but its WOFF2 subset output is
  // invisible in standards-compliant PDF renderers such as Poppler. Expand
  // the packaged web font to its original sfnt/TrueType representation before
  // embedding so the generated PDF renders consistently.
  const bytes = await decompressFont(await readFile(path));
  return {
    bytes,
    characters: new Set(fontkit.create(bytes).characterSet),
  };
}

function decompressFont(compressed: Uint8Array) {
  // wawoff2 exposes views over one shared WebAssembly heap. Serialize calls
  // and copy each result before allowing the next conversion to reuse it.
  const conversion = fontDecompressionQueue.then(async () =>
    Uint8Array.from(await decompressWoff2(compressed))
  );
  fontDecompressionQueue = conversion.then(
    () => undefined,
    () => undefined,
  );
  return conversion;
}

function wrapPdfText(text: string, fonts: EmbeddedFont[], size: number, width: number) {
  if (!text) return [""];
  const lines: string[] = [];
  let line = "";

  for (const word of text.split(" ")) {
    const candidate = line ? `${line} ${word}` : word;
    if (measurePdfText(candidate, fonts, size) <= width) {
      line = candidate;
      continue;
    }

    if (line) lines.push(line);
    const fragments = splitOversizedWord(word, fonts, size, width);
    lines.push(...fragments.slice(0, -1));
    line = fragments.at(-1) ?? "";
  }

  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function splitOversizedWord(word: string, fonts: EmbeddedFont[], size: number, width: number) {
  if (measurePdfText(word, fonts, size) <= width) return [word];
  const fragments: string[] = [];
  let fragment = "";
  for (const { segment: character } of graphemeSegmenter.segment(word)) {
    const candidate = `${fragment}${character}`;
    if (fragment && measurePdfText(candidate, fonts, size) > width) {
      fragments.push(fragment);
      fragment = character;
    } else {
      fragment = candidate;
    }
  }
  if (fragment) fragments.push(fragment);
  return fragments.length ? fragments : [word];
}

function drawPdfText(
  page: PDFPage,
  text: string,
  fonts: EmbeddedFont[],
  x: number,
  y: number,
  size: number,
  color: ReturnType<typeof rgb>,
  width: number,
) {
  const layout = getPdfTextLayout(text, fonts);
  const textWidth = measureFontRuns(layout.runs, size);
  let cursor = layout.baseLevel % 2 === 0 ? x : x + Math.max(0, width - textWidth);
  for (const run of layout.runs) {
    page.drawText(run.text, { x: cursor, y, size, font: run.font, color });
    cursor += run.font.widthOfTextAtSize(run.text, size);
  }
}

function measurePdfText(text: string, fonts: EmbeddedFont[], size: number) {
  return measureFontRuns(getPdfTextLayout(text, fonts).runs, size);
}

function measureFontRuns(runs: Array<Pick<FontRun, "text" | "font">>, size: number) {
  return runs.reduce(
    (width, run) => width + run.font.widthOfTextAtSize(run.text, size),
    0,
  );
}

function getPdfTextLayout(text: string, fonts: EmbeddedFont[]) {
  if (!text) return { runs: [] as FontRun[], baseLevel: 0 };
  const embedding = bidi.getEmbeddingLevels(text);
  const logicalRuns: FontRun[] = [];
  let previousFont: EmbeddedFont | undefined;

  for (const { segment, index } of graphemeSegmenter.segment(text)) {
    const selected = selectFont(segment, fonts, previousFont);
    const fallback = selected ? undefined : selectReplacement(fonts);
    const fontAsset = selected ?? fallback?.font;
    if (!fontAsset) continue;

    const level = embedding.levels[index] ?? embedding.paragraphs[0]?.level ?? 0;
    const renderedText = selected
      ? mirrorRtlCharacters(segment, index, embedding.levels)
      : fallback?.text ?? "?";
    const previous = logicalRuns.at(-1);
    if (
      previous?.font === fontAsset.font
      && previous.level === level
      && previous.end + 1 === index
    ) {
      previous.text += renderedText;
      previous.end = index + segment.length - 1;
    } else {
      logicalRuns.push({
        text: renderedText,
        font: fontAsset.font,
        level,
        start: index,
        end: index + segment.length - 1,
      });
    }
    previousFont = fontAsset;
  }

  return {
    runs: orderRunsVisually(text, embedding, logicalRuns),
    baseLevel: embedding.paragraphs[0]?.level ?? 0,
  };
}

function selectFont(
  text: string,
  fonts: EmbeddedFont[],
  previous: EmbeddedFont | undefined,
) {
  const codePoints = Array.from(text, (character) => character.codePointAt(0))
    .filter((codePoint): codePoint is number => codePoint !== undefined && requiresFontGlyph(codePoint));
  if (codePoints.length === 0) return previous ?? fonts[0];

  if (/^\s+$/u.test(text) && previous && supportsAll(previous, codePoints)) {
    return previous;
  }
  return fonts.find((candidate) => supportsAll(candidate, codePoints));
}

function supportsAll(font: FontAsset, codePoints: number[]) {
  return codePoints.every((codePoint) => font.characters.has(codePoint));
}

function requiresFontGlyph(codePoint: number) {
  return codePoint !== 0x200C
    && codePoint !== 0x200D
    && !(codePoint >= 0x202A && codePoint <= 0x202E)
    && !(codePoint >= 0x2060 && codePoint <= 0x206F)
    && !(codePoint >= 0xFE00 && codePoint <= 0xFE0F)
    && !(codePoint >= 0xE0100 && codePoint <= 0xE01EF);
}

function selectReplacement(fonts: EmbeddedFont[]) {
  for (const text of REPLACEMENT_GLYPHS) {
    const codePoint = text.codePointAt(0);
    const font = fonts.find((candidate) => codePoint !== undefined && candidate.characters.has(codePoint));
    if (font) return { text, font };
  }
  return undefined;
}

function mirrorRtlCharacters(text: string, sourceStart: number, levels: Uint8Array) {
  let result = "";
  let sourceOffset = 0;
  for (const character of text) {
    const sourceIndex = sourceStart + sourceOffset;
    const mirrored = levels[sourceIndex] % 2 === 1
      ? bidi.getMirroredCharacter(character)
      : null;
    result += mirrored ?? character;
    sourceOffset += character.length;
  }
  return result;
}

function orderRunsVisually<T extends IndexedRun>(
  text: string,
  embedding: ReturnType<typeof bidi.getEmbeddingLevels>,
  runs: T[],
) {
  if (runs.length < 2) return runs;
  const runAtIndex = new Array<number>(text.length);
  runs.forEach((run, runIndex) => {
    for (let index = run.start; index <= run.end; index += 1) {
      runAtIndex[index] = runIndex;
    }
  });

  const visualRunIndexes: number[] = [];
  for (const sourceIndex of bidi.getReorderedIndices(text, embedding)) {
    const runIndex = runAtIndex[sourceIndex];
    if (runIndex === undefined || visualRunIndexes.at(-1) === runIndex) continue;
    visualRunIndexes.push(runIndex);
  }
  return visualRunIndexes.map((runIndex) => runs[runIndex]);
}

function addFooters(pages: PDFPage[], font: PDFFont) {
  pages.forEach((page, index) => {
    page.drawLine({ start: { x: 46, y: 35 }, end: { x: 566, y: 35 }, thickness: 0.5, color: rgb(0.82, 0.84, 0.83) });
    page.drawText(`100 Questions | Private audit | Page ${index + 1} of ${pages.length}`, { x: 46, y: 20, size: 7, font, color: rgb(0.45, 0.47, 0.46) });
  });
}
