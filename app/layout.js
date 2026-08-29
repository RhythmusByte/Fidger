import "./globals.css";
import Providers from "../components/Providers";

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
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
