import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prospect CRM",
  description: "CRM privado de prospecção multicanal",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={geist.className}>
        <Theme accentColor="jade" grayColor="slate" radius="large" scaling="100%" appearance="dark">
          {children}
        </Theme>
      </body>
    </html>
  );
}
