const observer = new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')})},{threshold:.15});
document.querySelectorAll('.fade').forEach(el=>observer.observe(el));

async function submitLead(event){
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.getElementById('formStatus');
  const payload = Object.fromEntries(new FormData(form).entries());

  status.textContent = 'Enviando...';
  status.style.color = '#9bb6ff';

  try {
    const res = await fetch('/api/contact',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });

    if(!res.ok){
      throw new Error('Request failed');
    }

    status.textContent='✅ Solicitud enviada. Te contactaremos en breve.';
    status.style.color='#00FF9D';
    form.reset();
  } catch {
    status.textContent='❌ Error enviando el formulario. Inténtalo de nuevo.';
    status.style.color='#ff7171';
  }
}
