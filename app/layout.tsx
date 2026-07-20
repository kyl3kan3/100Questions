import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://100-questions-psi.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "100 Questions — AI Visibility Benchmark",
    template: "%s · 100 Questions",
  },
  description:
    "Measure how often your brand appears in web-grounded answers from OpenAI, Anthropic, and Google—with transparent scores, sources, and methodology.",
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
  alternates: { canonical: "/" },
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
      "See whether AI puts your brand in the answer. Compare grounded visibility across OpenAI, Anthropic, and Google.",
    url: "/",
    siteName: "100 Questions",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "100 Questions — AI Visibility Benchmark",
    description:
      "See whether AI puts your brand in the answer across OpenAI, Anthropic, and Google.",
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
    "@type": "SoftwareApplication",
    name: "100 Questions",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "A web-grounded AI visibility benchmark across OpenAI, Anthropic, and Google.",
    url: siteUrl,
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
