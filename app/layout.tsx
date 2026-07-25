import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PipeFlow CRM",
  description: "CRM multi-empresa com pipeline visual e integração WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body>{children}</body>
    </html>
  );
}
