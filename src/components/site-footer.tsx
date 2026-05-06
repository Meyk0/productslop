import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Product Slop. The front page of AI slop.</p>
        <nav className="flex flex-wrap gap-4">
          <Link href="/faq" className="hover:text-foreground">
            FAQ
          </Link>
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <a href="mailto:takedown@productslop.com" className="hover:text-foreground">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
