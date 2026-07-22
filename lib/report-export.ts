import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

type ExportPayload = NonNullable<Awaited<ReturnType<typeof import("@/lib/runs").getRunResultsForUser>>>;

export function buildResultsCsv(payload: ExportPayload) {
  const header = [
    "Question", "Cohort", "Category", "Provider", "Status", "Grounding", "Score eligible",
    "Brand mentioned", "Prominence", "Sentiment", "Owned domain cited", "Competitors mentioned",
    "Source URLs", "Answer",
  ];
  const records = payload.rows.map(({ question, job, result }) => [
    question.text,
    question.cohort,
    question.category,
    job?.provider ?? "",
    job?.status ?? "pending",
    result?.groundingStatus ?? "",
    result?.scoreEligible ?? false,
    result?.targetMentioned ?? false,
    result?.prominence ?? "",
    result?.sentiment ?? "",
    result?.ownedDomainCited ?? false,
    result?.competitorMentions.map((item) => item.name).join(" | ") ?? "",
    result?.sources.map((source) => source.url).join(" | ") ?? "",
    result?.answerText ?? job?.errorMessage ?? "",
  ]);

  return [header, ...records].map((record) => record.map(csvCell).join(",")).join("\r\n");
}

export async function buildResultsPdf(payload: ExportPayload) {
  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  let page = document.addPage([612, 792]);
  let y = 742;

  const write = (text: string, options: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; gap?: number } = {}) => {
    const size = options.size ?? 9;
    const font = options.bold ? bold : regular;
    const lines = wrapPdfText(sanitizePdfText(text), font, size, 520);
    for (const line of lines) {
      if (y < 54) {
        page = document.addPage([612, 792]);
        y = 742;
      }
      page.drawText(line, { x: 46, y, size, font, color: options.color ?? rgb(0.16, 0.18, 0.17) });
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
    write(`${row.question.sortOrder}. ${row.question.text}`, { bold: true, size: 10, gap: 2 });
    write(`${row.job.provider.toUpperCase()} | ${row.result?.scoreEligible ? "grounded and eligible" : row.job.status} | ${row.result?.targetMentioned ? "brand mentioned" : "brand not mentioned"}`, { size: 8, color: rgb(0.28, 0.31, 0.3), gap: 2 });
    if (row.result?.answerText) write(row.result.answerText, { size: 8, gap: 2 });
    const sources = row.result?.sources.map((source) => source.url).join(" | ");
    if (sources) write(`Sources: ${sources}`, { size: 7, color: rgb(0.2, 0.42, 0.34), gap: 10 });
  }

  addFooters(document.getPages(), regular);
  document.setTitle(`${payload.run.subjectName} AI visibility audit`);
  document.setAuthor("100 Questions");
  document.setSubject("Web-grounded model benchmark and action plan");
  return document.save();
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[",\r\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function sanitizePdfText(value: string) {
  return value.normalize("NFKD").replace(/[^\x20-\x7E\n]/gu, "-").replace(/\s+/gu, " ").trim();
}

function wrapPdfText(text: string, font: PDFFont, size: number, width: number) {
  const words = text.split(/\s+/u);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= width) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function addFooters(pages: PDFPage[], font: PDFFont) {
  pages.forEach((page, index) => {
    page.drawLine({ start: { x: 46, y: 35 }, end: { x: 566, y: 35 }, thickness: 0.5, color: rgb(0.82, 0.84, 0.83) });
    page.drawText(`100 Questions | Private audit | Page ${index + 1} of ${pages.length}`, { x: 46, y: 20, size: 7, font, color: rgb(0.45, 0.47, 0.46) });
  });
}
