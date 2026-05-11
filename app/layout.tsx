import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OGPAYTRUE",
  description: "Premium Client Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#0a0a0a",
              color: "#ffffff",
              border:
                "1px solid rgba(139,92,246,0.25)",
              borderRadius: "18px",
              padding: "16px",
              fontSize: "14px",
              boxShadow:
                "0 0 35px rgba(139,92,246,0.18)",
            },

            success: {
              style: {
                border:
                  "1px solid rgba(16,185,129,0.25)",
              },
            },

            error: {
              style: {
                border:
                  "1px solid rgba(239,68,68,0.25)",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
