import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aptitude AI | Discover Your Future",
  description: "Advanced AI-powered career counseling and aptitude testing for the next generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-indigo-500/30">
        {children}
      </body>
    </html>
  );
}
