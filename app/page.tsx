import Link from 'next/link';
import { AnimatedWrapper } from '@/components/animated-wrapper';
import { SectionTitle } from '@/components/section-title';

const solutionCards = [
  { title: 'Omnicanal 24/7', body: 'Atiende por voz, chat, email, WhatsApp y RRSS desde un único panel.' },
  { title: 'Integración con CRM', body: 'Conecta Salesforce, HubSpot y herramientas internas sin fricción.' },
  { title: 'IA y automatización', body: 'Bots inteligentes y flujos automatizados para reducir tiempos y costes.' },
  { title: 'Escalabilidad bajo demanda', body: 'Aumenta capacidad operativa sin perder calidad de servicio.' },
];

const technology = ['WhatsApp', 'Chat Web', 'Email', 'RRSS', 'Voz IP', 'CRM Integrations', 'AI Bots'];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10 py-20 md:py-28">
        <div className="absolute inset-0 -z-10 bg-grid bg-[size:24px_24px] opacity-20" />
        <div className="section-shell">
          <AnimatedWrapper>
            <p className="mb-4 inline-flex rounded-full border border-electricBlue/50 bg-electricBlue/10 px-4 py-1 text-sm text-electricBlue">
              Contact Center 100% Digital
            </p>
            <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">
              Digital First. <span className="text-electricBlue">Human Always.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/75">
              Conectamos marcas y personas en tiempo real con atención omnicanal impulsada por IA.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/contact" className="glow-button">Solicitar demo</Link>
              <Link href="/contact" className="glow-button-secondary">Hablar con un asesor</Link>
            </div>
          </AnimatedWrapper>
        </div>
      </section>

      <section className="section-shell py-16">
        <AnimatedWrapper>
          <SectionTitle title="El servicio al cliente tradicional ya no funciona." />
          <ul className="grid gap-4 md:grid-cols-2">
            {['Procesos lentos', 'Equipos saturados', 'Falta de integración', 'Poca analítica'].map((item) => (
              <li key={item} className="card p-5 text-white/80">• {item}</li>
            ))}
          </ul>
        </AnimatedWrapper>
      </section>

      <section className="section-shell py-16">
        <AnimatedWrapper>
          <SectionTitle title="La evolución del Contact Center" />
          <div className="grid gap-5 md:grid-cols-2">
            {solutionCards.map((card) => (
              <article key={card.title} className="card p-6">
                <h3 className="text-xl font-semibold text-neonGreen">{card.title}</h3>
                <p className="mt-2 text-white/75">{card.body}</p>
              </article>
            ))}
          </div>
        </AnimatedWrapper>
      </section>

      <section className="section-shell py-16">
        <AnimatedWrapper>
          <SectionTitle title="Cómo funciona" />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              '1. Integramos tus canales',
              '2. Automatizamos y optimizamos',
              '3. Escalamos tu atención',
            ].map((step) => (
              <div key={step} className="card p-6 text-lg font-medium">{step}</div>
            ))}
          </div>
        </AnimatedWrapper>
      </section>

      <section className="section-shell py-16">
        <AnimatedWrapper>
          <SectionTitle title="Tradicional vs Nexora" subtitle="Comparativa orientada a resultados B2B." />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-white/90">Modelo tradicional</h3>
              <ul className="mt-4 space-y-2 text-white/70">
                <li>• Silos entre canales</li>
                <li>• Costes fijos altos</li>
                <li>• Baja trazabilidad</li>
              </ul>
            </div>
            <div className="card border-electricBlue/40 p-6 shadow-glow">
              <h3 className="text-xl font-semibold text-electricBlue">NEXORA Digital Contact</h3>
              <ul className="mt-4 space-y-2 text-white/90">
                <li>• Visión omnicanal en tiempo real</li>
                <li>• Escala flexible por demanda</li>
                <li>• Analítica accionable con IA</li>
              </ul>
            </div>
          </div>
        </AnimatedWrapper>
      </section>

      <section className="section-shell py-16">
        <AnimatedWrapper>
          <SectionTitle title="Tecnología conectada a tu ecosistema" />
          <div className="flex flex-wrap gap-3">
            {technology.map((item) => (
              <span key={item} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80">
                {item}
              </span>
            ))}
          </div>
        </AnimatedWrapper>
      </section>

      <section className="section-shell py-16">
        <AnimatedWrapper>
          <SectionTitle title="Lo que dicen nuestros clientes" />
          <div className="grid gap-5 md:grid-cols-3">
            {['Retail Enterprise', 'Fintech Scale-up', 'Insurtech B2B'].map((company) => (
              <blockquote key={company} className="card p-6 text-white/80">
                “NEXORA nos ayudó a reducir un 38% el tiempo medio de respuesta.”
                <footer className="mt-4 text-sm text-white/50">— {company}</footer>
              </blockquote>
            ))}
          </div>
        </AnimatedWrapper>
      </section>

      <section className="section-shell pb-8 pt-16">
        <AnimatedWrapper>
          <div className="card border-electricBlue/40 p-10 text-center shadow-glow">
            <h2 className="text-3xl font-bold md:text-4xl">Transforma tu atención al cliente hoy.</h2>
            <Link href="/contact" className="glow-button mt-7 text-lg">
              Solicitar demo gratuita
            </Link>
          </div>
        </AnimatedWrapper>
      </section>
    </div>
  );
}
