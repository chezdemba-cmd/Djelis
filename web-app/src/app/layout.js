import "./globals.css";
import { SessionProvider } from "../context/SessionContext";
import LayoutClient from "./LayoutClient";

export const metadata = {
  title: "Djeli'S - Streaming VOD & Audio",
  description: "Plateforme de streaming d'Afrique de l'Ouest",
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
