import "./globals.css";
import type { Metadata } from "next";
import AppAlert from "./components/AppAlert";
import TelegramButton from "./components/TelegramButton";

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
      <body>
        {children}
        <TelegramButton />
        <AppAlert />
      </body>
    </html>
  );
}
