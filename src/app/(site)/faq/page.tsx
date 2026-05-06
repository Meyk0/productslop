import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "How Product Slop submissions and reactions work.",
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="font-mono text-sm font-black uppercase text-slop-orange">FAQ</p>
      <h1 className="mt-3 text-4xl font-black tracking-normal sm:text-5xl">
        The simple version.
      </h1>
      <div className="mt-8 divide-y divide-line rounded-[8px] border border-line bg-white">
        <FaqItem
          question="What can I launch?"
          answer="AI side projects, tiny tools, demos, experiments, and strange weekend builds. The product should be safe to visit and should not impersonate someone else."
        />
        <FaqItem
          question="Do I need an account?"
          answer="No. Submissions can include an email only so the app can send a private edit or delete link."
        />
        <FaqItem
          question="What if I do not get an email?"
          answer="The success card always shows the private edit/delete link. Email only sends when the mail provider is configured."
        />
        <FaqItem
          question="How does ranking work?"
          answer="Launches are sorted by reaction totals inside the selected time window. Ties favor newer launches."
        />
        <FaqItem
          question="Are there comments or a forum?"
          answer="No. The first version is only submissions, reactions, daily winners, and share cards."
        />
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <section className="p-5">
      <h2 className="text-lg font-black">{question}</h2>
      <p className="mt-2 leading-7 text-muted">{answer}</p>
    </section>
  );
}
