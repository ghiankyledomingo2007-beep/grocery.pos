import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "POS System - Modern Point of Sale",
  description: "Professional web-based POS system for retail stores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
