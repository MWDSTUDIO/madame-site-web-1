/* Madame Wedding Design — renders one wedding page from /data/weddings.json.
   The page shell carries static <title>/<meta> for SEO; this fills the body. */

(function () {
  var main = document.querySelector('[data-wedding-slug]');
  if (!main) return;
  var slug = main.getAttribute('data-wedding-slug');

  fetch('/data/weddings.json').then(function (r) { return r.json(); }).then(function (data) {
    var w = data.weddings.find(function (x) { return x.slug === slug; });
    if (!w) { main.innerHTML = '<div class="page-hero"><h1 class="page-hero__title">Celebration not found.</h1></div>'; return; }

    var photos = (w.portfolio && w.portfolio.photos) || [];
    var cover = photos[0] || null;
    var tints = ['ph--a', 'ph--b', 'ph--c'];

    var html = '';
    html += '<section class="wedding-hero">' +
      (cover
        ? '<img src="' + cover.src + '" alt="' + cover.alt + '">'
        : '<div class="ph-hero" role="img" aria-label="' + w.displayTitle + ' — ' + w.destination + '"></div>') +
      '</section>';

    html += '<div class="page-hero">' +
      '<p class="page-hero__eyebrow">' + w.destination + ' · ' + w.year + '</p>' +
      '<h1 class="page-hero__title">' + w.displayTitle + '</h1>' +
      '<p class="page-hero__meta">' + w.coupleOrigin + '</p>' +
      '</div>';

    html += '<div class="prose"><p class="lede">' + w.story + '</p></div>';

    if (photos.length > 1) {
      html += '<div class="gallery">' + photos.slice(1).map(function (p) {
        return '<figure><img src="' + p.src + '" alt="' + p.alt + '" loading="lazy"></figure>';
      }).join('') + '</div>';
    } else if (photos.length === 0) {
      /* No photographs yet — quiet placeholders */
      html += '<div class="gallery">' + [0, 1, 2].map(function (i) {
        return '<figure><div class="ph ' + tints[i] + '"></div></figure>';
      }).join('') + '</div>';
    }

    if (w.journal && w.journal.published) {
      html += '<div class="detail-journal-link"><a class="link-quiet" href="/journal/' + w.slug + '/">Read the story in the Journal →</a></div>';
    }

    html += '<section class="cta-band"><p>Dreaming of ' + (w.destination.split(',').pop().trim()) + '?</p>' +
      '<a class="inquire__cta" href="/inquire/">Inquire</a></section>';

    main.innerHTML = html;
  });
})();
