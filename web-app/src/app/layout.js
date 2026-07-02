import "./globals.css";

export const metadata = {
  title: "Djeli'S - Streaming VOD & Audio",
  description: "Plateforme de streaming d'Afrique de l'Ouest",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
