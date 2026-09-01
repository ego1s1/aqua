import type { Metadata } from "next";
import "./globals.css";
import { SITE } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: `${SITE.displayName} — Aqua Desktop`,
  description: "Priyanshu Sharma — ECE @ MIT Manipal '27. Portfolio as Mac OS X Aqua desktop.",
  metadataBase: new URL(SITE.siteUrl),
  icons: { icon: "/assets/logo-32.png", apple: "/assets/logo-128.png" },
  openGraph: {
    title: `${SITE.displayName} — Aqua Desktop`,
    description: "Where hardware talks to software. Portfolio as Mac OS X 10.0 Aqua desktop.",
    url: SITE.siteUrl,
    siteName: `${SITE.displayName} - Portfolio`,
    images: [{ url: "/assets/avatar.jpeg", width: 200, height: 200 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
