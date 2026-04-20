import "./globals.css";
import ToasterProvider from "@/components/ToasterProvider";

export const metadata = {
  title: "Quiz Admin",
  description: "Admin panel for Quiz App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
