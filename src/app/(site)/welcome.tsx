import { Cloud, X } from "lucide-react";
import Link from "next/link";

export function HomeWelcome() {
  return (
    <section className="flex items-center justify-between gap-4 rounded-[8px] bg-[#fff3e8] p-4 sm:p-6">
      <div className="flex items-center gap-4">
        <div className="grid size-16 shrink-0 place-items-center rounded-[8px] border border-amber-100 bg-white text-slop-orange">
          <Cloud className="size-9" />
        </div>
        <div>
          <h2 className="text-lg font-black sm:text-xl">Welcome to Product Slop!</h2>
          <p className="mt-1 text-base text-muted sm:text-lg">
            The place to launch and discover new AI weekend projects.{" "}
            <Link href="/about" className="font-black text-slop-orange">
              Take a tour.
            </Link>
          </p>
        </div>
      </div>
      <button
        type="button"
        className="hidden size-12 shrink-0 place-items-center rounded-full border border-amber-100 bg-white text-muted sm:grid"
        aria-label="Dismiss welcome"
      >
        <X className="size-6" />
      </button>
    </section>
  );
}
