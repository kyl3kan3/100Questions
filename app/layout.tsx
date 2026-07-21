import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import { GlobalFooter } from "@/components/global-footer";
import { JsonLd } from "@/components/json-ld";
import {
  absoluteUrl,
  SITE_NAME,
  SITE_URL,
  SOCIAL_IMAGE,
} from "@/lib/site";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const GOOGLE_ANALYTICS_ID = "G-9S1WQ6LGPR";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "100 Questions — AI Visibility Benchmark",
    template: "%s · 100 Questions",
  },
  description:
    "Compare 100 planned web-grounded provider answers to 25 shared questions across OpenAI, Claude, Gemini, and Grok—with transparent, directional results.",
  applicationName: "100 Questions",
  authors: [{ name: "100 Questions" }],
  creator: "100 Questions",
  publisher: "100 Questions",
  category: "technology",
  keywords: [
    "AI visibility",
    "AI visibility tool",
    "AI search visibility",
    "AI brand visibility",
    "LLM visibility",
    "generative engine optimization",
    "GEO tool",
    "GEO analytics",
    "AI search monitoring",
    "AI brand monitoring",
    "AI citation tracking",
    "AI search share of voice",
    "LLM benchmark",
    "AI citations",
  ],
  alternates: { canonical: absoluteUrl() },
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/logo-mark.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.webmanifest",
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? {
          other: {
            "msvalidate.01": process.env.BING_SITE_VERIFICATION,
          },
        }
      : {}),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "100 Questions — AI Visibility Benchmark",
    description:
      "Compare 100 planned web-grounded provider answers to 25 shared questions across OpenAI, Claude, Gemini, and Grok.",
    url: absoluteUrl(),
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "100 Questions — AI Visibility Benchmark",
    description:
      "25 shared questions, four AI models, and 100 planned provider answers for a directional visibility benchmark.",
    images: [SOCIAL_IMAGE],
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#070908",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${absoluteUrl()}#organization`,
        name: SITE_NAME,
        url: absoluteUrl(),
        description:
          "A source-backed AI visibility benchmark comparing one shared question set across OpenAI, Claude, Gemini, and Grok.",
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/logo-mark.svg"),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${absoluteUrl()}#website`,
        name: SITE_NAME,
        url: absoluteUrl(),
        description:
          "Measure brand visibility, citations, competitor share of voice, and coverage across web-grounded AI answers.",
        publisher: { "@id": `${absoluteUrl()}#organization` },
        inLanguage: "en-US",
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          src="https://datafa.st/js/script.js"
          data-website-id="dfid_WIXXIARdwVFPbyM6Mib8P"
          data-domain="100questionsai.com"
          strategy="afterInteractive"
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <GlobalFooter />
        <JsonLd data={structuredData} />
      </body>
    </html>
  );
}
