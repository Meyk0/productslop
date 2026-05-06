import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "What Product Slop is and why it exists.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="font-mono text-sm font-black uppercase text-slop-orange">What is this</p>
      <h1 className="mt-3 text-4xl font-black tracking-normal sm:text-5xl">
        A launch board for AI weekend projects.
      </h1>
      <div className="mt-8 space-y-5 text-lg leading-8 text-muted">
        <p>
          Product Slop is a tiny launch board where makers paste a URL, get an
          AI-written tagline, receive a type badge, and share the resulting card.
        </p>
        <p>
          V0 intentionally skips accounts, comments, newsletters, and editorial
          curation. The goal is a low-friction loop: launch, reveal, react, share.
        </p>
        <p>
          Contact and takedown requests go to{" "}
          <a className="font-bold text-foreground" href="mailto:takedown@productslop.com">
            takedown@productslop.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
