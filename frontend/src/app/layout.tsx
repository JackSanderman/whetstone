import type { Metadata } from 'next';
import { Big_Shoulders_Display, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const display = Big_Shoulders_Display({
  weight: ['500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const body = Hanken_Grotesk({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WHETSTONE - an on-chain AI craft-honing bench',
  description:
    'WHETSTONE is an on-chain AI craft-honing bench on GenLayer. A maker forges a single piece toward a craft target, then submits successive refined drafts. A Master Assessor scores each draft under validator consensus, attempts accrue as an ordered lineage, and the piece locks immutable once a draft clears the seal bar and beats its prior best.',
  openGraph: {
    title: 'WHETSTONE',
    description:
      'Forge a piece, temper it draft by draft, and let an on-chain Master Assessor score the craft under validator consensus. Seal it when it clears the bar.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WHETSTONE',
    description:
      'An on-chain AI craft-honing bench. Forge, temper, seal. Every score is settled under validator consensus on GenLayer Bradbury Testnet.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
