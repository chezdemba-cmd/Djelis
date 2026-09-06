import "./globals.css";
import { SessionProvider } from "../context/SessionContext";
import LayoutClient from "./LayoutClient";

export const viewport = {
  themeColor: "#e50914",
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  title: "Djeli'S - Streaming VOD & Audio",
  description: "Plateforme de streaming d'Afrique de l'Ouest",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Djeli'S",
  },
  icons: {
    icon: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <SessionProvider>
          <LayoutClient>
            {children}
          </LayoutClient>
        </SessionProvider>
      </body>
    </html>
  );
}
