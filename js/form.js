/* ==========================================================
   Inquiry form — client-side validation & submit handling
   No backend is connected in this template. Wire the marked
   section below to your form endpoint, CRM webhook, or email
   service of choice.
========================================================== */

export function initInquiryForm(formId = 'inquiryForm', statusId = 'formStatus') {
  const form = document.getElementById(formId);
  const status = document.getElementById(statusId);
  if (!form || !status) return;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();

    if (!name || !email || !message) {
      status.textContent = 'Please fill in your name, email, and project details.';
      status.style.color = '#ff6b6b';
      return;
    }
    if (!emailPattern.test(email)) {
      status.textContent = 'Please enter a valid email address.';
      status.style.color = '#ff6b6b';
      return;
    }

    // ---- Connect to a real endpoint here, e.g.: ----
    // await fetch('/api/inquiries', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(Object.fromEntries(new FormData(form)))
    // });

    status.textContent = `Thanks, ${name.split(' ')[0]} — your inquiry has been noted. We'll reply within one business day.`;
    status.style.color = '';
    form.reset();
  });
}
