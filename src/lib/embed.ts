import { pipeline } from "@xenova/transformers";

type FeatureExtractor = Awaited<ReturnType<typeof pipeline>>;

let extractor: FeatureExtractor | null = null;

export async function getEmbedding(text: string) {
  if (!extractor) {
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }

  const output = (await extractor(text, {
    pooling: "mean",
    normalize: true,
  })) as { data: ArrayLike<number> };

  return Array.from(output.data);
}
