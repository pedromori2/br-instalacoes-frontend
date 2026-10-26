import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Providers } from "@/components/providers";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: BRAND_TAGLINE,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={montserrat.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
