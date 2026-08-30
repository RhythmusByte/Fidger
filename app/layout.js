import "./globals.css";
import Providers from "../components/Providers";
import ThemeScript from "../components/ThemeScript";

export const metadata = {
  title: "My Finance, Notes & Todos",
  description: "Personal finance tracker, notes, and to-do list",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#2e1065",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-zinc-50 dark:bg-surface text-zinc-950 dark:text-ink min-h-screen transition-colors">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
