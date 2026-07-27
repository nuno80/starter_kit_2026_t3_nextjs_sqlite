import type { Metadata, Viewport } from "next";
import { InstallButton } from "@/components/InstallButton";

export const metadata: Metadata = {
  title: "Nome App",
  description: "Descrizione della tua app",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nome App",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        {children}
        <InstallButton />
      </body>
    </html>
  );
}
