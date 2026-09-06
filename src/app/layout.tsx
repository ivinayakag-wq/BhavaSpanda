import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

const playfair = Playfair_Display({
  variable: "--font-name",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Isha Connect - Community for Spiritual Seekers",
  description:
    "Exclusive dating & community platform for Isha meditators. Find meaningful, life-long partnerships within the Isha community.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "IshaConnect",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#EC4899",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} antialiased`}
    >
      <body className="min-h-dvh bg-background text-foreground font-body antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#FFFFFF",
              color: "#1A1A1A",
              border: "1px solid #EBEBEB",
              borderRadius: "12px",
              boxShadow: "0 8px 30px rgba(236,72,153,0.08)",
            },
            success: { iconTheme: { primary: "#EC4899", secondary: "#FFFFFF" } },
            error: { iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" } },
          }}
        />
      </body>
    </html>
  );
}
