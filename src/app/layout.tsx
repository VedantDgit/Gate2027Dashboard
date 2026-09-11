import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GATE 2027 Command Center | CS + DA Preparation & Progress Intelligence',
  description:
    'Futuristic personal preparation operating system for GATE 2027 (Computer Science & Data Science / AI). Featuring full syllabus mastery matrices, spaced revision cycles, PYQ accuracy tracking, mock analytics, and weakness intelligence.',
  keywords: [
    'GATE 2027',
    'GATE CS',
    'GATE DA',
    'Data Science & AI',
    'Computer Science',
    'GATE Preparation Tracker',
    'Spaced Revision',
    'GATE Mock Tests',
  ],
  authors: [{ name: 'GATE 2027 Aspirant' }],
};

import { ThemeProvider } from '@/components/providers/ThemeProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased selection:bg-sky-500/30">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
