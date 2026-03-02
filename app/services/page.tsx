import { SectionTitle } from '@/components/section-title';

const services = [
  'Outsourcing de atención omnicanal 24/7',
  'Automatización conversacional con IA',
  'Integración de CRM y plataformas de soporte',
  'Consultoría de CX y optimización de KPIs',
];

export default function ServicesPage() {
  return (
    <section className="section-shell py-16">
      <SectionTitle
        title="Servicios diseñados para operaciones B2B"
        subtitle="Arquitectura modular para acompañar cada fase de crecimiento." 
      />
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <article key={service} className="card p-6">
            <h3 className="text-lg font-semibold text-neonGreen">{service}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
