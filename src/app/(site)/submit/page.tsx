import type { Metadata } from "next";
import { SubmitForm } from "@/components/submit-form";

export const metadata: Metadata = {
  title: "Submit Slop",
  description: "Paste a URL and get a Product Slop trading card.",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <p className="font-mono text-sm font-black uppercase text-slop-orange">
          QR-friendly submission
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-normal sm:text-5xl">
          Paste a URL. Get a card.
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted">
          No accounts, no profiles, no curation theater. The local build creates
          an in-memory launch while service keys are not configured.
        </p>
      </div>
      <SubmitForm />
    </div>
  );
}
