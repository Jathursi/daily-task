import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import RealtimeAlertSystem from "@/components/RealtimeAlertSystem";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SmartLife Tracker - AI Productivity Dashboard",
  description: "Track your daily habits, study hours, work hours, mood, sleep, notes, and productivity insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen">
          <Sidebar />
          <RealtimeAlertSystem />
          <main className="flex-1 ml-[280px] p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
