import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const googleAnalyticsId = "G-348BVX3FH7";

export const metadata: Metadata = {
  metadataBase: new URL("https://productslop.com"),
  title: {
    default: "Product Slop",
    template: "%s | Product Slop",
  },
  description: "The front page of AI slop.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Product Slop",
    description: "The front page of AI slop.",
    siteName: "Product Slop",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Product Slop",
    description: "The front page of AI slop.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAnalyticsId}');
          `}
        </Script>
        <div className="flex min-h-dvh flex-col">{children}</div>
      </body>
    </html>
  );
}
