import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0F382A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Ondera Agro-Mesh | Offline-First Multi-Agent System",
  description:
    "Store-and-forward edge multi-agent mesh for Ondera highlands coffee farmers. Offline diagnostics, Claude agronomic advisory, and market price protection.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ondera Agro",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#051A11] text-[#F0FDF4]">
        {children}
      </body>
    </html>
  );
}
