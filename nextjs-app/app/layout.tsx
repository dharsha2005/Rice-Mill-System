import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rice Mill Management System',
  description: 'Enterprise Rice Mill ERP System - Procurement, Milling, Sales & Inventory Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
