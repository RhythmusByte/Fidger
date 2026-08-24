import "./globals.css";

export const metadata = {
  title: "Fidger",
  description: "Private personal finance dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
