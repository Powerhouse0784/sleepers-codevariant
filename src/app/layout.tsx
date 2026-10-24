import type { Metadata, Viewport } from "next";
import { Poppins, Caveat_Brush } from "next/font/google";
import "./globals.css";
import Shell from "@/components/Shell";

const body = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--font-body" });
const script = Caveat_Brush({ subsets: ["latin"], weight: "400", variable: "--font-script" });
export const metadata: Metadata = { title: "Event Bee Buzz", description: "Keep the buzz going after the event." };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={`${body.variable} ${script.variable}`} suppressHydrationWarning>
      <body><Shell>{children}</Shell></body>
    </html>
  );
}
