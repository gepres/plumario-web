const form = document.querySelector<HTMLFormElement>('[data-waitlist]');

if (form) {
  const email = form.querySelector<HTMLInputElement>('input[type="email"]')!;
  const message = form.querySelector<HTMLElement>('[data-waitlist-message]')!;
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!email.value.trim() || !email.validity.valid) {
      email.setAttribute('aria-invalid', 'true');
      message.textContent = 'Escribe un correo válido, como nombre@correo.com.';
      email.focus();
      return;
    }

    email.removeAttribute('aria-invalid');
    submit.disabled = true;
    submit.textContent = 'Enviando…';
    message.textContent = '';

    try {
      const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>);
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (!response.ok) throw new Error(`Respuesta ${response.status}`);
      message.textContent = `Listo. Te avisaremos en ${email.value.trim()}.`;
      submit.textContent = 'Apuntado';
      email.readOnly = true;
    } catch {
      submit.disabled = false;
      submit.textContent = 'Avísame cuando salga';
      message.textContent = 'No se pudo guardar tu correo. Revisa tu conexión e inténtalo de nuevo.';
    }
  });
}
