import type { Metadata } from "next";
import Link from "next/link";

import { ChatgptStartupVisibilityWidget } from "@/components/chatgpt-startup-visibility-widget";
import { MarketingHeader } from "@/components/marketing-header";
import { GlobalFooter } from "@/components/global-footer";
import {
  buildChatgptStartupCheckPlayerCardMeta,
  chatgptStartupCheckEmbedUrl,
  CHATGPT_STARTUP_CHECK_PATH,
  X_PLAYER_EMBED_QUERY,
  X_PLAYER_HEIGHT,
  X_PLAYER_WIDTH,
} from "@/lib/x-player-card";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

type PageProps = {
  searchParams: Promise<{ embed?: string }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const isEmbed = params.embed === "1";
  const card = buildChatgptStartupCheckPlayerCardMeta();
  const shareUrl = absoluteUrl(CHATGPT_STARTUP_CHECK_PATH);

  if (isEmbed) {
    return {
      title: card.title,
      description: card.description,
      robots: { index: false, follow: false },
      alternates: { canonical: shareUrl },
    };
  }

  return {
    title: { absolute: `${card.title} | ${SITE_NAME}` },
    description: card.description,
    robots: { index: false, follow: true },
    alternates: { canonical: shareUrl },
    openGraph: {
      title: card.title,
      description: card.description,
      url: shareUrl,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: card.imageUrl,
          width: 1200,
          height: 900,
          alt: card.title,
        },
      ],
    },
    twitter: {
      card: "player",
      title: card.title,
      description: card.description,
      images: [card.imageUrl],
      players: {
        playerUrl: card.embedUrl,
        streamUrl: card.embedUrl,
        width: X_PLAYER_WIDTH,
        height: X_PLAYER_HEIGHT,
      },
    },
  };
}

export default async function ChatgptStartupCheckPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const isEmbed = params.embed === "1";

  if (isEmbed) {
    return (
      <main className="min-h-[480px] bg-[#070908]">
        <ChatgptStartupVisibilityWidget embed />
      </main>
    );
  }

  const card = buildChatgptStartupCheckPlayerCardMeta();

  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-10">
        <p className="eyebrow">X Player Card</p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
          {card.title}
        </h1>
        <p className="mt-5 max-w-2xl text-pretty leading-7 text-zinc-400">
          Run a fast discovery preview inside an X post, then graduate to the
          full 100-question benchmark when you need stored answers across four
          providers. This preview scores public-site technical readiness — it
          does not query ChatGPT live.
        </p>

        <div className="mt-10">
          <ChatgptStartupVisibilityWidget />
        </div>

        <section className="mt-12 space-y-4 text-sm leading-6 text-zinc-400">
          <h2 className="text-lg font-semibold text-white">Share on X</h2>
          <p>
            Post{" "}
            <Link
              className="text-emerald-300 underline underline-offset-4"
              href={CHATGPT_STARTUP_CHECK_PATH}
            >
              {card.shareUrl}
            </Link>{" "}
            — the Player Card embeds{" "}
            <code className="text-zinc-300">{X_PLAYER_EMBED_QUERY}</code> at{" "}
            {chatgptStartupCheckEmbedUrl()}.
          </p>
          <p>
            iOS may show tap-to-open instead of an inline player. Desktop and
            web X typically render the 640×480 iframe when card tags validate.
          </p>
        </section>
      </main>
      <GlobalFooter />
    </>
  );
}
