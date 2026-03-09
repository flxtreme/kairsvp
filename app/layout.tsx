import type { Metadata } from "next";
import { Bungee_Outline, Geist, Geist_Mono, Londrina_Sketch, Londrina_Solid, Rye, Style_Script } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const styleScript = Style_Script({
  variable: "--font-style-script",
  subsets: ["latin"],
  weight: "400"
});

const bungeeOutline = Bungee_Outline({
  variable: "--font-bungee-outline",
  subsets: ["latin"],
  weight: "400"
});

const londrinaSolid = Londrina_Solid({
  variable: "--font-londrina-solid",
  subsets: ["latin"],
  weight: "400"
});

const londrinaSketch = Londrina_Sketch({
  variable: "--font-londrina-scketch",
  subsets: ["latin"],
  weight: "400"
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kaiden Felix's",
  description: "You are invited to Kaiden Felix's Chirstening and 1st Birthday Party.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${styleScript.variable} ${londrinaSolid.variable} ${londrinaSketch.variable} ${bungeeOutline.variable} antialiased h-screen w-full overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
