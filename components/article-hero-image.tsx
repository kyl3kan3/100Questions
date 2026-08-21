import Image from "next/image";

import { getArticleImage } from "@/lib/page-images";

export function ArticleHeroImage({ path }: { path: string }) {
  const image = getArticleImage(path);
  if (!image) return null;

  return (
    <figure className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0b0e0c]">
      <Image
        src={image.path}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes="(min-width: 1280px) 1152px, (min-width: 768px) 92vw, 100vw"
        className="h-auto w-full"
      />
      <figcaption className="border-t border-white/[0.07] px-5 py-4 text-xs leading-5 text-zinc-400 sm:px-6">
        {image.caption}
      </figcaption>
    </figure>
  );
}
