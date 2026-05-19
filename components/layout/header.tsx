"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Headphones, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandMark } from "@/components/icons/brand";
import { CartButton } from "@/components/cart/icon-button";
import { UserMenu } from "@/components/layout/user-menu";

export function Header() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="container-x flex h-16 items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="EngajaAI início">
          <BrandMark size={28} />
          <span className="text-base font-bold tracking-tight">EngajaAI</span>
        </Link>

        <form
          onSubmit={onSubmit}
          className="hidden md:flex flex-1 max-w-xl mx-auto"
          role="search"
        >
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produto"
              className="pl-9"
              aria-label="Buscar produto"
            />
          </div>
        </form>

        <nav className="flex items-center gap-1 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden sm:inline-flex"
            aria-label="Suporte"
          >
            <a
              href="https://wa.me/0000000000"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Headphones />
              <span className="hidden md:inline">Suporte</span>
            </a>
          </Button>
          <UserMenu />
          <CartButton />
        </nav>
      </div>
      <form
        onSubmit={onSubmit}
        className="container-x pb-3 md:hidden"
        role="search"
      >
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produto"
            className="pl-9"
            aria-label="Buscar produto"
          />
        </div>
      </form>
    </header>
  );
}
