import { ContactForm } from '@/components/contact-form';
import { SectionTitle } from '@/components/section-title';

export default function ContactPage() {
  return (
    <section className="section-shell py-16">
      <SectionTitle
        title="Hablemos de tu operación de atención al cliente"
        subtitle="Déjanos tus datos y te mostraremos una propuesta adaptada a tu negocio." 
      />
      <ContactForm />
    </section>
  );
}
