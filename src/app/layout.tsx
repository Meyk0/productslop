import type { Metadata } from "next";
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
        <div className="flex min-h-dvh flex-col">{children}</div>
      </body>
    </html>
  );
}
