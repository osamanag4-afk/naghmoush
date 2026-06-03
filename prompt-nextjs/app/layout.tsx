import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'مولّد البرومبت الاحترافي لـ Claude',
  description: 'أداة لتوليد أفضل Prompt احترافي مناسب لـ Claude AI — اكتب موضوعك وانتظر النتيجة.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
