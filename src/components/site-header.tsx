import { Menu, Rocket, Search } from "lucide-react";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <details className="group relative md:hidden">
          <summary
            className="grid size-11 cursor-pointer list-none place-items-center rounded-full text-muted transition hover:bg-slate-100 hover:text-foreground [&::-webkit-details-marker]:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-7" />
          </summary>
          <nav className="absolute left-0 top-14 z-30 w-56 rounded-[8px] border border-line bg-white p-2 text-base font-bold shadow-lg">
            <MobileLink href="/">Best Slop</MobileLink>
            <MobileLink href="/hall-of-slop">Hall</MobileLink>
            <MobileLink href="/faq">FAQ</MobileLink>
          </nav>
        </details>

        <Link
          href="/"
          className="grid size-12 shrink-0 place-items-center rounded-full bg-slop-orange text-3xl font-black text-white sm:size-12"
          aria-label="Product Slop home"
        >
          S
        </Link>

        <form
          action="/"
          role="search"
          className="hidden h-11 w-80 items-center gap-3 rounded-full bg-slate-100 px-4 text-muted md:flex"
        >
          <Search className="size-5 shrink-0" aria-hidden="true" />
          <input
            name="q"
            type="search"
            aria-label="Search launches"
            placeholder="Search launches"
            className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted"
          />
        </form>

        <nav className="ml-auto hidden items-center gap-8 text-base font-bold text-foreground lg:flex">
          <HeaderLink href="/">Best Slop</HeaderLink>
          <HeaderLink href="/hall-of-slop">Hall</HeaderLink>
          <HeaderLink href="/faq">FAQ</HeaderLink>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link
            href="/submit"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-slop-orange px-4 font-black text-white transition hover:bg-slop-orange-strong"
          >
            <Rocket className="size-4" />
            Launch
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="hover:text-slop-orange">
      {children}
    </Link>
  );
}

function MobileLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block rounded-[8px] px-3 py-2 hover:bg-slop-cream">
      {children}
    </Link>
  );
}
