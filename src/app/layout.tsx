import Link from "next/link";
import type { Metadata } from "next";
import UserSelector from "@/components/UserSelector";
import "./globals.css";

export const metadata: Metadata = {
    title: "Collaborative Editor",
    description:
        "A lightweight collaborative document editor built with Next.js, Prisma, and TipTap.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <div className="mx-auto min-h-screen max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                    <header className="surface mb-6 rounded-[28px] px-5 py-4 sm:px-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-2">
                                <Link href="/documents" className="text-2xl font-semibold tracking-tight">
                                    Collaborative Editor
                                </Link>
                                <p className="max-w-2xl text-sm text-[var(--muted)]">
                                    Create rich-text documents, import Markdown or text files, and
                                    share work with seeded users through a typed API layer.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <nav className="flex items-center gap-2 text-sm">
                                    <Link
                                        href="/documents"
                                        className="rounded-full border border-[var(--border)] px-3 py-1.5 transition hover:bg-white/80"
                                    >
                                        Documents
                                    </Link>
                                    <Link
                                        href="/shared"
                                        className="rounded-full border border-[var(--border)] px-3 py-1.5 transition hover:bg-white/80"
                                    >
                                        Shared With Me
                                    </Link>
                                </nav>
                                <UserSelector />
                            </div>
                        </div>
                    </header>

                    <main>{children}</main>
                </div>
            </body>
        </html>
    );
}
