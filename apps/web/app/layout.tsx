import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Overtime',
  description: 'Swiss-format CS2 tournaments for community organizers.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col antialiased">
        <div className="flex flex-1 flex-col">{children}</div>
        <footer className="border-t px-4 py-6 text-center text-xs text-muted-foreground">
          Unofficial — uses the FACEIT Data API.
        </footer>
      </body>
    </html>
  );
}
