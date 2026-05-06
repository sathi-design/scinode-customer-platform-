import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SCINODE — Supplier Portal",
  description: "The intelligent supplier portal for CROs, manufacturers, and scientists.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
