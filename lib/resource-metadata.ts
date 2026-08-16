import type { Metadata } from "next";

import { absoluteUrl, SITE_NAME, SOCIAL_IMAGE } from "./site";

type ResourceMetadataInput = {
  path: `/${string}`;
  title: string;
  description: string;
  publishedTime?: string;
  modifiedTime?: string;
};

export function buildResourceMetadata({
  path,
  title,
  description,
  publishedTime = "2026-08-03",
  modifiedTime = "2026-08-10",
}: ResourceMetadataInput): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "article",
      locale: "en_US",
      publishedTime,
      modifiedTime,
      images: [SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SOCIAL_IMAGE],
    },
  };
}
