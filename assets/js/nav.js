/* Madame Wedding Design — mobile navigation (burger + full-screen overlay).
   Builds itself from the existing .nav__links so there is one menu to maintain. */

(function () {
  var nav = document.querySelector('.nav');
  var links = document.querySelector('.nav__links');
  if (!nav || !links) return;

  /* Burger button, appended inside the header */
  var burger = document.createElement('button');
  burger.className = 'nav__burger';
  burger.setAttribute('aria-label', 'Open menu');
  burger.setAttribute('aria-expanded', 'false');
  burger.innerHTML = '<span></span><span></span>';
  nav.appendChild(burger);

  /* Full-screen overlay, appended to <body> (outside any mix-blend context) */
  var overlay = document.createElement('div');
  overlay.className = 'mobmenu';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML =
    '<button class="mobmenu__close" aria-label="Close menu">×</button>' +
    '<nav class="mobmenu__links" aria-label="Mobile navigation">' + links.innerHTML + '</nav>';
  document.body.appendChild(overlay);

  function setOpen(open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    overlay.setAttribute('aria-hidden', String(!open));
  }

  burger.addEventListener('click', function () { setOpen(true); });
  overlay.querySelector('.mobmenu__close').addEventListener('click', function () { setOpen(false); });
  overlay.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setOpen(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
})();
