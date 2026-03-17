import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OT Vantage | Pipeline Intelligence",
  description: "OT cybersecurity pipeline tracker with live signal intelligence from federal, commercial, and regulatory sources",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0a0a0f]">
        {children}
      </body>
    </html>
  );
}
