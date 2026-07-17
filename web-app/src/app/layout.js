import "./globals.css";

export const metadata = {
  title: "Djeli'S - Streaming VOD & Audio",
  description: "Plateforme de streaming d'Afrique de l'Ouest",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
