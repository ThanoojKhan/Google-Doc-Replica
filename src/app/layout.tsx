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
            <body className="min-h-screen">
                <div className="page-shell mx-auto min-h-screen max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8">
                    <header className="shell-card mb-6">
                        <div className="grid gap-8 px-5 py-6 sm:px-6 xl:grid-cols-[1.35fr_0.9fr] xl:px-8">
                            <div className="space-y-6">
                                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.34em] text-[var(--muted)]">
                                    <span>Editorial Workspace</span>
                                </div>

                                <div className="space-y-3">
                                    <Link href="/documents" className="block max-w-3xl">
                                        <span className="masthead-brand block text-4xl leading-none sm:text-5xl xl:text-6xl">
                                            Editorial Docs
                                        </span>
                                    </Link>
                                    <p className="max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                                        A collaborative workspace for drafting, editing, importing and sharing
                                        documents.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Link href="/documents" className="pill-button">
                                        My Documents
                                    </Link>
                                    <Link href="/shared" className="ghost-button">
                                        Shared Feed
                                    </Link>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 xl:items-end">
                                <div className="w-full max-w-md rounded-4xl border border-[var(--border)] bg-[var(--surface-strong)] p-4">
                                    <p className="section-kicker mb-2 text-[var(--muted)]">Active view</p>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                                            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                                                Mode
                                            </p>
                                            <p className="mt-1 text-lg font-semibold text-[var(--text)]">
                                                Collaborative
                                            </p>
                                        </div>
                                        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                                            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                                                Focus
                                            </p>
                                            <p className="mt-1 text-lg font-semibold text-[var(--text)]">
                                                Writing + sharing
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <UserSelector />
                            </div>
                        </div>
                    </header>

                    <main className="pb-8">{children}</main>

                    <footer className="mt-6 border-t border-[var(--border)] px-1 py-4 text-center text-xs tracking-[0.16em] text-[var(--muted)] uppercase">
                        Built by thanooj
                    </footer>
                </div>
            </body>
        </html>
    );
}
