import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { getErpSettings } from "@/lib/data/settings";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DoorHub ERP | Door & Hardware Order Management",
  description:
    "Premium internal dashboard for door and hardware order management",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const settings = await getErpSettings();

  const darkCookie = cookieStore.get("doorhub_dark_mode")?.value;
  const accentCookie = cookieStore.get("doorhub_accent")?.value;

  const darkMode =
    darkCookie === "1" ? true : darkCookie === "0" ? false : settings.dark_mode;
  const accentColor = accentCookie ?? settings.accent_color;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${darkMode ? "dark" : ""}`}
      style={{ "--accent": accentColor } as React.CSSProperties}
    >
      <body className="min-h-full font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
