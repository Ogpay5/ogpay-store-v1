import "./globals.css";
import type { Metadata } from "next";
import AppAlert from "./components/AppAlert";
import TelegramButton from "./components/TelegramButton";
import LanguageToggle from "./components/LanguageToggle";

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
        <LanguageToggle />
        <TelegramButton />
        <AppAlert />
      </body>
    </html>
  );
}
