import { SectionTitle } from '@/components/section-title';

export default function AboutPage() {
  return (
    <section className="section-shell py-16">
      <SectionTitle
        title="Sobre NEXORA Digital Contact"
        subtitle="Somos un partner estratégico para equipos de customer experience en empresas B2B con foco en crecimiento." 
      />
      <div className="card space-y-4 p-8 text-white/80">
        <p>
          NEXORA nace para modernizar la atención al cliente con una operación digital, trazable y escalable.
        </p>
        <p>
          Combinamos talento humano especializado con automatización de IA para diseñar experiencias omnicanal que mejoran NPS, retención y eficiencia operativa.
        </p>
      </div>
    </section>
  );
}
