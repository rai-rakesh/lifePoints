import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'LifePoint Tracker',
    description: 'Gamify your life by tracking points for good and bad habits.',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0', // Prevent zoom on mobile for app-like feel
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    );
}
