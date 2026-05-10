import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "eFootball City Cup 2026 | Local Gaming Tournament",
  description:
    "Join the biggest eFootball community tournament in the city. Compete, win prizes, and prove you're the best. Registration open now.",
  keywords: ["eFootball", "tournament", "gaming", "esports", "Nigeria", "local", "prizes"],
  openGraph: {
    title: "eFootball City Cup 2026",
    description: "Win ₦10,000 in the ultimate eFootball community tournament!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-dark-900 antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#0F1A2E",
              color: "#fff",
              border: "1px solid rgba(42,63,96,0.7)",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#0F1A2E" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#0F1A2E" },
            },
          }}
        />
      </body>
    </html>
  );
}
