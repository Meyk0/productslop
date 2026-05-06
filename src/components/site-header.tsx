import { ChevronDown, LogIn, Search, Send } from "lucide-react";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="grid size-12 shrink-0 place-items-center rounded-full bg-slop-orange text-3xl font-black text-white"
          aria-label="Product Slop home"
        >
          S
        </Link>

        <div className="hidden h-11 w-72 items-center gap-3 rounded-full bg-slate-100 px-4 text-muted md:flex">
          <Search className="size-5" />
          <span className="text-base">Search (later)</span>
        </div>

        <nav className="ml-auto hidden items-center gap-8 text-base font-bold text-foreground lg:flex">
          <HeaderLink href="/">Best Slop</HeaderLink>
          <HeaderLink href="/hall-of-slop">Launches</HeaderLink>
          <HeaderLink href="/about">News</HeaderLink>
          <HeaderLink href="/legal">Legal</HeaderLink>
          <Link href="/submit" className="hover:text-slop-orange">
            Advertise
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link
            href="/submit"
            className="hidden h-11 items-center gap-2 rounded-full border border-line bg-white px-4 font-black transition hover:border-slate-300 sm:inline-flex"
          >
            <Send className="size-4" />
            Submit
          </Link>
          <Link
            href="/submit"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-slop-orange px-4 font-black text-white transition hover:bg-slop-orange-strong"
          >
            <LogIn className="size-4" />
            Launch
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 hover:text-slop-orange">
      {children}
      <ChevronDown className="size-4" />
    </Link>
  );
}
