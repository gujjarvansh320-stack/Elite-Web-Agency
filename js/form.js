// /* ==========================================================
//    Inquiry form — client-side validation & submit handling
//    No backend is connected in this template. Wire the marked
//    section below to your form endpoint, CRM webhook, or email
//    service of choice.
// ========================================================== */

// export function initInquiryForm(formId = 'inquiryForm', statusId = 'formStatus') {
//   const form = document.getElementById(formId);
//   const status = document.getElementById(statusId);
//   if (!form || !status) return;

//   const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//   form.addEventListener('submit', (e) => {
//     e.preventDefault();

//     const name = form.querySelector('#name').value.trim();
//     const email = form.querySelector('#email').value.trim();
//     const message = form.querySelector('#message').value.trim();

//     if (!name || !email || !message) {
//       status.textContent = 'Please fill in your name, email, and project details.';
//       status.style.color = '#ff6b6b';
//       return;
//     }
//     if (!emailPattern.test(email)) {
//       status.textContent = 'Please enter a valid email address.';
//       status.style.color = '#ff6b6b';
//       return;
//     }

//     // ---- Connect to a real endpoint here, e.g.: ----
//     // await fetch('/api/inquiries', {
//     //   method: 'POST',
//     //   headers: { 'Content-Type': 'application/json' },
//     //   body: JSON.stringify(Object.fromEntries(new FormData(form)))
//     // });

//     status.textContent = `Thanks, ${name.split(' ')[0]} — your inquiry has been noted. We'll reply within one business day.`;
//     status.style.color = '';
//     form.reset();
//   });
// }




/* ==========================================================
   Inquiry form — client-side validation & submit handling
   Integrated with Custom Dropdown & WhatsApp redirection
========================================================== */

// Your provided WhatsApp number is set as the default
export function initInquiryForm(formId = 'inquiryForm', statusId = 'formStatus', whatsappNumber = '917404707263') {
  const form = document.getElementById(formId);
  const status = document.getElementById(statusId);
  
  if (!form || !status) return;

  // --- 1. Custom Dropdown Logic ---
  const selectWrapper = document.getElementById('serviceSelectWrapper');
  const selectTrigger = document.getElementById('serviceTrigger');
  const selectLabel = document.getElementById('serviceLabel');
  const hiddenInput = document.getElementById('service');
  
  if (selectWrapper && selectTrigger && selectLabel && hiddenInput) {
    const options = document.querySelectorAll('.custom-option');

    // Toggle dropdown open/close
    selectTrigger.addEventListener('click', () => {
      selectWrapper.classList.toggle('open');
    });

    // Handle option selection
    options.forEach(option => {
      option.addEventListener('click', function() {
        const value = this.getAttribute('data-value');
        
        // Update UI and hidden input
        selectLabel.textContent = value;
        hiddenInput.value = value;
        
        // Close dropdown
        selectWrapper.classList.remove('open');
      });
    });

    // Close dropdown if clicking outside
    document.addEventListener('click', (e) => {
      if (!selectWrapper.contains(e.target)) {
        selectWrapper.classList.remove('open');
      }
    });
  }

  // --- 2. Form Submission Logic ---
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();
    
    // Grab the value from our custom dropdown (if it exists on the page)
    const service = hiddenInput ? hiddenInput.value.trim() : 'Not specified'; 

    // Validation
    if (!name || !email || !message || (hiddenInput && !service)) {
      status.textContent = 'Please fill in all fields and select a service.';
      status.style.color = '#ff6b6b';
      return;
    }
    if (!emailPattern.test(email)) {
      status.textContent = 'Please enter a valid email address.';
      status.style.color = '#ff6b6b';
      return;
    }

    // --- 3. WhatsApp Integration ---
    
    // Construct the message with the selected service included
    const rawText = `*New Agency Inquiry*\n\n*Name:* ${name}\n*Email:* ${email}\n*Service Requested:* ${service}\n*Message:* ${message}`;
    
    // Encode the text so it can safely be passed in a URL
    const encodedText = encodeURIComponent(rawText);
    
    // Strip any +, -, or spaces from the phone number
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    
    // Build the final Click-to-Chat URL
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedText}`;

    // Open WhatsApp in a new browser tab
    window.open(whatsappUrl, '_blank');

    // Update UI for the user
    status.textContent = `Thanks, ${name.split(' ')[0]} — redirecting you to WhatsApp...`;
    status.style.color = '#4ade80';
    form.reset();
    
    // Reset custom dropdown UI specifically
    if (hiddenInput && selectLabel) {
      hiddenInput.value = '';
      selectLabel.textContent = 'Select a service';
    }
  });
}