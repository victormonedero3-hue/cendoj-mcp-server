import Link from 'next/link';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-carbon/80 backdrop-blur">
      <div className="section-shell flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-wide text-white">
          NEXORA <span className="text-electricBlue">Digital Contact</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
          <Link href="/about" className="hover:text-neonGreen">Sobre nosotros</Link>
          <Link href="/services" className="hover:text-neonGreen">Servicios</Link>
          <Link href="/contact" className="hover:text-neonGreen">Contacto</Link>
        </nav>
        <Link href="/contact" className="glow-button-secondary text-sm">
          Solicitar demo
        </Link>
      </div>
    </header>
  );
}
