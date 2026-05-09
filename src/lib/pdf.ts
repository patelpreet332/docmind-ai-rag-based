// Use the parser module directly. The package entrypoint (`pdf-parse/index.js`)
// contains debug code that can run under bundlers and tries to read a local test PDF.
import pdfParse from "pdf-parse/lib/pdf-parse.js";

type PdfParseResult = {
  text?: string;
  numpages?: number;
};

type PdfParseOptions = {
  version?: string;
};

export class PdfExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfExtractionError";
  }
}

export async function extractPdfText(buffer: Buffer) {
  const versionsToTry = ["default", "v2.0.550", "v1.10.100", "v1.10.88"];
  let lastError: unknown;
  let data: PdfParseResult | null = null;

  for (const version of versionsToTry) {
    try {
      data = (await pdfParse(buffer, { version } as PdfParseOptions)) as PdfParseResult;
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!data) {
    const message =
      lastError instanceof Error ? lastError.message : "Failed to parse PDF";
    throw new PdfExtractionError(`Unreadable or corrupted PDF: ${message}`);
  }

  return {
    text: data.text?.trim() || "",
    pages: data.numpages || 0,
  };
}
