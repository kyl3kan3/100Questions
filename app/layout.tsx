import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import { GlobalFooter } from "@/components/global-footer";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/site";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    "generative engine optimization",
    "GEO analytics",
    "AI search monitoring",
    "brand visibility",
    "LLM benchmark",
    "AI citations",
  ],
  alternates: { canonical: absoluteUrl() },
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: [{ url: "/logo-mark.svg", type: "image/svg+xml" }],
    shortcut: "/logo-mark.svg",
  },
  manifest: "/manifest.webmanifest",
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
  },
  twitter: {
    card: "summary_large_image",
    title: "100 Questions — AI Visibility Benchmark",
    description:
      "25 shared questions, four AI models, and 100 planned provider answers for a directional visibility benchmark.",
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
        logo: absoluteUrl("/logo-mark.svg"),
      },
      {
        "@type": "WebSite",
        "@id": `${absoluteUrl()}#website`,
        name: SITE_NAME,
        url: absoluteUrl(),
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
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <GlobalFooter />
        <JsonLd data={structuredData} />
      </body>
    </html>
  );
}
