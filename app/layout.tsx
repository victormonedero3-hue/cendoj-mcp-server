import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'NEXORA Digital Contact | Contact Center omnicanal con IA',
  description:
    'NEXORA Digital Contact impulsa la atención al cliente con IA, automatización y omnicanalidad para empresas B2B.',
  keywords: ['contact center digital', 'omnicanal', 'atención al cliente con IA', 'B2B', 'NEXORA'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
