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
  themeColor: "#0f172a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen transition-colors">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
