import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
        />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body suppressHydrationWarning>
        {children}
        <script src="/script.js" defer></script>
      </body>
    </html>
  );
}
