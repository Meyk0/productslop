import { Clock, Sparkles, Triangle } from "lucide-react";
import Link from "next/link";

export function SubmitChallenge() {
  return (
    <aside className="rounded-[8px] border border-orange-100 bg-[#f8ead8] p-5">
      <div className="flex items-center gap-4">
        <div className="grid size-14 place-items-center rounded-[8px] bg-slop-orange text-3xl font-black text-white">
          S
        </div>
        <div>
          <h2 className="text-xl font-black">Launch today</h2>
          <p className="text-muted">A tiny launch board for AI side projects</p>
        </div>
      </div>

      <ul className="mt-6 space-y-3 text-sm text-muted">
        <SidebarPoint icon={<Sparkles className="size-4" />} text="Paste a URL and get a launch card." />
        <SidebarPoint icon={<Triangle className="size-4" />} text="Reactions decide the ranking." />
        <SidebarPoint icon={<Clock className="size-4" />} text="Daily board resets at 00:00 UTC." />
      </ul>

      <Link
        href="/submit"
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-slop-orange px-5 font-black text-white transition hover:bg-slop-orange-strong"
      >
        Launch now
      </Link>
    </aside>
  );
}

function SidebarPoint({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex gap-2 leading-6">
      <span className="mt-1 text-slop-orange">{icon}</span>
      <span>{text}</span>
    </li>
  );
}
