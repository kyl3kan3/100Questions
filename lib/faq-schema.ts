type FaqEntry = {
  question: string;
  answer: string;
};

export function buildFaqPageNode(
  pageUrl: string,
  faqs: readonly FaqEntry[],
  options?: { id?: string; name?: string },
) {
  const id = options?.id ?? `${pageUrl}#faq`;

  return {
    "@type": "FAQPage",
    "@id": id,
    ...(options?.name ? { name: options.name } : {}),
    url: pageUrl,
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}
