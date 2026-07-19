/* Madame Wedding Design — renders one Journal story from /data/weddings.json. */

(function () {
  var main = document.querySelector('[data-journal-slug]');
  if (!main) return;
  var slug = main.getAttribute('data-journal-slug');

  fetch('/data/weddings.json').then(function (r) { return r.json(); }).then(function (data) {
    var w = data.weddings.find(function (x) { return x.slug === slug; });
    if (!w || !w.journal || !w.journal.published) {
      main.innerHTML = '<div class="page-hero"><h1 class="page-hero__title">Story not found.</h1></div>';
      return;
    }
    var j = w.journal;
    var photos = (j.photos && j.photos.length ? j.photos : (w.portfolio.photos || []).slice(0, 3));

    var html = '';
    html += '<div class="page-hero">' +
      '<p class="page-hero__eyebrow">The Journal · ' + w.destination + ' · ' + w.year + '</p>' +
      '<h1 class="page-hero__title">' + j.title + '</h1>' +
      '<p class="page-hero__meta">' + w.coupleOrigin + '</p>' +
      '</div>';

    html += '<div class="prose"><p class="lede">' + j.story + '</p></div>';

    if (photos.length) {
      html += '<div class="gallery">' + photos.map(function (p) {
        return '<figure><img src="' + p.src + '" alt="' + p.alt + '" loading="lazy"></figure>';
      }).join('') + '</div>';
    }

    if (j.press && j.press.length) {
      html += '<div class="journal-list"><p class="press__label" style="margin-bottom:1rem">As featured in</p><ul class="press-links">' +
        j.press.map(function (p) {
          return '<li><a href="' + p.url + '" target="_blank" rel="noopener">' + p.name + '</a></li>';
        }).join('') + '</ul></div>';
    }

    html += '<div class="detail-journal-link"><a class="link-quiet" href="/weddings/' + w.slug + '/">See the full portfolio →</a></div>';

    html += '<section class="cta-band"><p>We accept a limited number of celebrations each year.</p>' +
      '<a class="inquire__cta" href="/inquire/">Inquire</a></section>';

    main.innerHTML = html;

    /* Article schema, from data */
    var ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": j.title,
      "about": w.displayTitle + " — " + w.destination,
      "author": { "@type": "Organization", "name": "Madame Wedding Design" },
      "publisher": { "@type": "Organization", "name": "Madame Wedding Design" }
    });
    document.head.appendChild(ld);
  });
})();
