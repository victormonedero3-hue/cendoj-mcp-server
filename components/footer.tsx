import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#080808] py-10">
      <div className="section-shell grid gap-8 md:grid-cols-4">
        <div>
          <p className="text-lg font-bold">NEXORA Digital Contact</p>
          <p className="mt-2 text-sm text-white/65">Digital First. Human Always.</p>
        </div>
        <div>
          <p className="font-semibold">Navegación</p>
          <ul className="mt-2 space-y-2 text-sm text-white/70">
            <li><Link href="/">Inicio</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/services">Servicios</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Contacto</p>
          <ul className="mt-2 space-y-2 text-sm text-white/70">
            <li>hello@nexora.digital</li>
            <li>+34 900 000 000</li>
            <li>Madrid · Barcelona · Remoto</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Redes</p>
          <ul className="mt-2 space-y-2 text-sm text-white/70">
            <li>LinkedIn</li>
            <li>X / Twitter</li>
            <li>YouTube</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
