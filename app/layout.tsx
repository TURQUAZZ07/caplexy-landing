import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caplexy | Learn English. Rise from Cadet to Admiral.",
  description:
    "Caplexy turns daily English practice into a naval career journey with missions, ranks, voyages, and rewards."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
