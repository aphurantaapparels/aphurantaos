import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aphuranta OS — Apparel Operations",
  description: "One connected operating system for apparel sales, production, finance, and client service.",
  applicationName: "Aphuranta OS",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
