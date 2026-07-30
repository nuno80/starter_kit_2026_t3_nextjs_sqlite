import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { I18nProvider } from "~/app/_components/i18n-provider";
import { Navbar } from "~/app/_components/navbar";
import { InstallButton } from "~/components/InstallButton";
import { NetworkStatus } from "~/components/NetworkStatus";
import { SerwistProvider } from "~/components/SerwistProvider";
import { UpdateBanner } from "~/components/UpdateBanner";

export const metadata: Metadata = {
  title: "Nuno Starter SQLite",
  description: "Modern full-stack starter kit with Next.js, tRPC, Drizzle, and Better-Auth on SQLite",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nuno Starter",
  },
};

export const viewport: Viewport = {
  themeColor: "#281c17",
};

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" suppressHydrationWarning className={`${fraunces.variable} ${instrumentSans.variable}`}>
      <body>
        <SerwistProvider>
          <TRPCReactProvider>
            <I18nProvider>
              <Navbar />
              <NetworkStatus />
              <div className="pt-14">{children}</div>
              <InstallButton />
              <UpdateBanner />
            </I18nProvider>
          </TRPCReactProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}


