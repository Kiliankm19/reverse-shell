import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { headers } from "next/headers";
import { Header } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://reverseshell.app/"),
  title: {
    default: "reverseshell",
    template: "%s | reverseshell",
  },
  description:
    "Client-side reverse shell generator with listeners, obfuscation helpers, and shell upgrade recipes for authorized security testing.",
  openGraph: {
    title: "reverseshell",
    description:
      "Generate reverse shell one-liners, listeners, obfuscation variants, and shell upgrade steps entirely in your browser.",
    url: "https://reverseshell.app/",
    siteName: "reverseshell",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "reverseshell",
    description:
      "Client-side reverse shell generator for authorized security testing.",
  },
  alternates: {
    canonical: "https://reverseshell.app/",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [messages, headersList] = await Promise.all([getMessages(), headers()]);
  const nonce = headersList.get("x-nonce") ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
            nonce={nonce}
          >
            <TooltipProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                {children}
                <SiteFooter />
              </div>
            </TooltipProvider>
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
