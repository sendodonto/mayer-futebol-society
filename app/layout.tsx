import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mayer | Seu próximo jogo começa aqui",
  description: "Escolha seu campo, encontre um horário e reúna seu time. Agende Fut5 e Fut7 na Mayer.",
  icons: {
    icon: "/images/mayer-mark.png",
    shortcut: "/images/mayer-mark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
