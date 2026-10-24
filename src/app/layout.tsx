import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Poppins, Caveat_Brush, Playfair_Display } from "next/font/google";
import "./globals.css";
import Shell from "@/components/Shell";

const body = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-body",
});

const script = Caveat_Brush({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-script",
});

const serif = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["italic"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Event Bee Buzz",
  description: "Keep the buzz going after the event.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${body.variable} ${script.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}