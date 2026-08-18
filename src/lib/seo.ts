import type { MetaDescriptor } from "react-router";

export const SITE_URL = "https://qislearn.nepcodex.com";
export const SITE_NAME = "QisLearn";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.svg`;

interface PageMetaOptions {
  title: string;
  description: string;
  /** Path starting with "/", e.g. "/" or "/lesson/what-is-a-qubit". */
  path: string;
  ldJson?: Record<string, unknown> | Record<string, unknown>[];
}

/** Builds a full, self-contained meta array (title through JSON-LD) for one route. */
export function buildPageMeta({ title, description, path, ldJson }: PageMetaOptions): MetaDescriptor[] {
  const url = `${SITE_URL}${path}`;
  const meta: MetaDescriptor[] = [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: DEFAULT_OG_IMAGE },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: DEFAULT_OG_IMAGE },
  ];
  if (ldJson) meta.push({ "script:ld+json": ldJson });
  return meta;
}
