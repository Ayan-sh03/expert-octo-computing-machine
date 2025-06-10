import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Materials Compare",
  description: "Search and compare materials from the Materials Project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
