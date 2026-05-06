"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Best Slop" },
  { href: "/hall-of-slop", label: "Hall" },
  { href: "/faq", label: "FAQ" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        className="grid size-11 place-items-center rounded-full text-muted transition hover:bg-slate-100 hover:text-foreground"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X className="size-7" /> : <Menu className="size-7" />}
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-20 cursor-default bg-transparent"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute left-0 top-14 z-30 w-56 rounded-[8px] border border-line bg-white p-2 text-base font-bold shadow-lg">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-[8px] px-3 py-2 hover:bg-slop-cream"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </>
      ) : null}
    </div>
  );
}
