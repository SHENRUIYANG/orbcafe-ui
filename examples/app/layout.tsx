import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ORBCAFE-UI",
  description: "ORBCAFE UI Examples",
  icons: {
    icon: "/orbcafe.png",
    shortcut: "/orbcafe.png",
    apple: "/orbcafe.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`antialiased ${montserrat.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
