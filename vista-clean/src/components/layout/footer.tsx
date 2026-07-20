import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-heading text-lg font-bold">
              VISTA<span className="text-primary">CLEAN</span>
            </span>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/vistaclean_/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@vistaclean_"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
              aria-label="TikTok"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.88 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.11v-3.5a6.37 6.37 0 00-.82-.05A6.34 6.34 0 003.15 15.7 6.34 6.34 0 009.49 22a6.34 6.34 0 006.34-6.34V9.4a8.16 8.16 0 003.76.92V6.87a4.85 4.85 0 01-.01-.18z" />
              </svg>
            </a>
            <a
              href="https://snapchat.com/t/jmqRG7mN"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
              aria-label="Snapchat"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C9.203 0 6.54.896 5.003 3.338c-1.258 1.998-1.058 4.596-1.058 6.662h-.003c-.762 0-2.186-.39-2.186 1.053 0 1.167 1.2 1.467 2.186 1.467.165 0 .33-.007.497-.018-.078.678-.27 1.353-.606 1.97-.455.837-1.2 1.456-2.006 1.907-.372.208-.596.4-.596.78 0 .82 1.487 1.28 2.16 1.45.235.06.405.337.465.577.062.247.127.5.35.63.54.31 1.33.15 1.93.15.46 0 .83.23 1.27.46.84.44 1.8.94 3.59.94 1.79 0 2.74-.5 3.59-.94.44-.23.81-.46 1.27-.46.6 0 1.39.16 1.93-.15.22-.13.29-.38.35-.63.06-.24.23-.52.46-.58.68-.17 2.17-.63 2.17-1.45 0-.38-.23-.57-.6-.78-.8-.45-1.55-1.07-2.01-1.91-.33-.62-.53-1.29-.6-1.97.17.01.33.02.5.02.98 0 2.18-.3 2.18-1.47 0-1.44-1.42-1.05-2.18-1.05h-.01c0-2.07.2-4.66-1.06-6.66C17.46.9 14.83 0 12.02 0z" />
              </svg>
            </a>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/mentions-legales" className="hover:text-foreground transition-colors">
              Mentions légales
            </Link>
            <span>© {new Date().getFullYear()} Vista Clean</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
