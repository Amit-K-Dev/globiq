import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row mx-auto px-4 sm:px-8">
        <p className="text-sm leading-loose text-center text-muted-foreground md:text-left">
          Built by{" "}
          <a
            href="https://amitforge.com"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            AmitForge
          </a>
          . The world. In numbers.
        </p>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <Link href="/about" className="hover:underline underline-offset-4">
            About
          </Link>
          <Link href="/privacy" className="hover:underline underline-offset-4">
            Privacy
          </Link>
          <Link href="/terms" className="hover:underline underline-offset-4">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
