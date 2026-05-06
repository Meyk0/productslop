import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal",
  description: "Terms, privacy, and takedown details for Product Slop.",
};

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="font-mono text-sm font-black uppercase text-slop-orange">
        Terms and takedown
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-normal sm:text-5xl">
        Keep the slop legal.
      </h1>
      <div className="mt-8 space-y-5 text-lg leading-8 text-muted">
        <p>
          Do not submit NSFW, hateful, scammy, phishing, malware, or rights-violating
          projects. Product Slop can remove submissions at any time.
        </p>
        <p>
          Optional email is only used for edit/delete magic links. Reaction sessions
          are stored through signed cookies once the durable backend lands.
        </p>
        <p>
          Send takedown requests to{" "}
          <a className="font-bold text-foreground" href="mailto:takedown@productslop.com">
            takedown@productslop.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
