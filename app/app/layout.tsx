import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DealProvider } from "@/lib/dealStore";
import { SessionProvider } from "@/lib/sessionStore";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Blockmediary — Trade Finance for the Small Guy",
  description: "LC-like trust for SME cross-border trade. No banks required.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <DealProvider>{children}</DealProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
