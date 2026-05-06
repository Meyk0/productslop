import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Slop",
  description: "Magic-link management for a submitted slop.",
};

type ManagePageProps = {
  params: Promise<{ token: string }>;
};

export default async function ManagePage({ params }: ManagePageProps) {
  const { token } = await params;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="font-mono text-sm font-black uppercase text-slop-orange">Magic link</p>
      <h1 className="mt-3 text-4xl font-black tracking-normal sm:text-5xl">
        Manage your slop
      </h1>
      <div className="mt-8 rounded-[8px] border border-line bg-white p-5">
        <p className="text-muted">
          Token received:{" "}
          <span className="font-mono text-foreground">{token.slice(0, 8)}...</span>
        </p>
        <p className="mt-3 text-muted">
          Edit and delete actions will connect to Supabase once the durable store is configured.
        </p>
      </div>
    </div>
  );
}
