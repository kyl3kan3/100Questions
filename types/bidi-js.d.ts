declare module "bidi-js" {
  type Direction = "ltr" | "rtl";

  type EmbeddingLevels = {
    levels: Uint8Array;
    paragraphs: Array<{
      start: number;
      end: number;
      level: number;
    }>;
  };

  type Bidi = {
    getEmbeddingLevels(text: string, explicitDirection?: Direction): EmbeddingLevels;
    getReorderedIndices(
      text: string,
      embeddingLevels: EmbeddingLevels,
      start?: number,
      end?: number,
    ): number[];
    getMirroredCharacter(character: string): string | null;
  };

  export default function bidiFactory(): Bidi;
}
