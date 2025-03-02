import './globals.css';
import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';

const nunito = Nunito({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-nunito'
});

export const metadata: Metadata = {
  title: 'Eggy Chess - A Strategic Stacking Game',
  description: 'A turn-based stacking chess game with egg pieces',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={nunito.className}>
        {children}
      </body>
    </html>
  );
}