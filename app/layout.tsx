import type { Metadata } from 'next';
import { Kodchasan, Nunito } from 'next/font/google';
import './globals.css';

export const metadata: Metadata = {
  title: 'United Servants for Jesus | Event details',
  description:
    'Join United Servants for Jesus. October 16–17, 2026.',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
    other: {
      rel: 'icon',
      url: '/icon.png',
    },
  },
};

const nunito = Nunito({ subsets: ['latin'], variable: '--font-Nunito' });
const kodchasan = Kodchasan({
  subsets: ['latin'],
  variable: '--font-Kodchasan',
  weight: ['200', '300', '400', '500', '600', '700'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${kodchasan.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
