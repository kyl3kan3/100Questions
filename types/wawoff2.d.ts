declare module "wawoff2/decompress" {
  export default function decompressWoff2(
    buffer: Uint8Array,
  ): Promise<Uint8Array>;
}
