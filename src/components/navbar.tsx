"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Image
              src={"/sui-vision-logo.png"}
              alt="sui-vision-logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Sui View
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={` font-medium transition-colors ${
                pathname === "/"
                  ? "text-theme-blue-600 dark:text-theme-blue-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              Home
            </Link>
            <Link
              href="/docs"
              className={` font-medium transition-colors ${
                pathname === "/docs"
                  ? "text-theme-blue-600 dark:text-theme-blue-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              Docs
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
