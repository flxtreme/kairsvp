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

const BASE_URL = "https://flxtreme.github.io/kairsvp";

export const metadata: Metadata = {
  title: "Kaiden Felix's",
  description: "You are invited to Kaiden Felix's Christening and 1st Birthday Party.",
  metadataBase: new URL(BASE_URL),
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Kaiden Felix's Christening & 1st Birthday 🦁",
    description: "You are invited to Kaiden Felix's Christening and 1st Birthday Party.",
    url: BASE_URL,
    siteName: "Kaiden Felix's Safari",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "Kaiden Felix's Christening & 1st Birthday Party Invitation",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaiden Felix's Christening & 1st Birthday 🦁",
    description: "You are invited to Kaiden Felix's Christening and 1st Birthday Party.",
    images: ["/preview.png"],
  },
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