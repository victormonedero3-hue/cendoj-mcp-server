const observer = new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')})},{threshold:.15});
document.querySelectorAll('.fade').forEach(el=>observer.observe(el));

async function submitLead(event){
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.getElementById('formStatus');
  const payload = Object.fromEntries(new FormData(form).entries());
  const res = await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if(res.ok){status.textContent='✅ Solicitud enviada. Te contactaremos en breve.';status.style.color='#00FF9D';form.reset();}
  else{status.textContent='❌ Error enviando el formulario.';status.style.color='#ff7171';}
}
