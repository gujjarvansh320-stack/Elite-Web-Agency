/* ==========================================================
   Mobile nav — hamburger toggle for the slide-in menu drawer
========================================================== */

export function initMobileNav() {
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('mobileMenu');
  const backdrop = document.getElementById('menuBackdrop');
  if (!toggle || !menu || !backdrop) return;

  function openMenu() {
    menu.classList.add('open');
    backdrop.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu.classList.remove('open');
    backdrop.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    if (menu.classList.contains('open')) closeMenu();
    else openMenu();
  });

  backdrop.addEventListener('click', closeMenu);

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeMenu();
  });
}
