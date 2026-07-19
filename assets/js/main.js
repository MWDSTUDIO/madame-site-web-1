/* Madame Wedding Design — home interactions: the threshold, sound, reveals, data. */

(function () {
  var intro = document.getElementById('intro');
  var site = document.getElementById('site');
  var enterBtn = document.getElementById('enterBtn');
  var soundBtn = document.getElementById('soundBtn');
  var music = document.getElementById('music');
  var siteVideo = document.getElementById('siteVideo');

  var soundOn = false;
  var musicAvailable = null; // separate music track (assets/audio/music.mp3), optional

  function videoVisible() {
    return siteVideo && getComputedStyle(siteVideo).display !== 'none';
  }

  function setSound(on) {
    soundOn = on;
    if (musicAvailable) {
      if (on) { music.play(); } else { music.pause(); }
    } else if (videoVisible()) {
      // The hero film carries its own soundtrack — unmute it directly.
      siteVideo.muted = !on;
      if (on) siteVideo.play().catch(function () {});
    }
    soundBtn.textContent = on ? '◑' : '◐';
    soundBtn.setAttribute('aria-pressed', String(on));
  }

  /* ---------- Enter — the user gesture that unlocks sound ---------- */

  enterBtn.addEventListener('click', function () {
    site.hidden = false;

    // The films begin only past the threshold — start the visible one now.
    document.querySelectorAll('.hero video').forEach(function (v) {
      if (getComputedStyle(v).display !== 'none') v.play().catch(function () {});
    });

    // Prefer a dedicated music track if one exists; otherwise the film's own
    // sound (mobile). On desktop with no music track, the site stays silent.
    music.play().then(function () {
      musicAvailable = true;
      soundBtn.hidden = false;
      setSound(true);
    }).catch(function () {
      musicAvailable = false;
      if (videoVisible()) {
        soundBtn.hidden = false;
        setSound(true);
      }
    });

    intro.classList.add('is-leaving');
    setTimeout(function () {
      intro.remove();
      document.querySelectorAll('.hero .reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
    }, 1400);

    initReveals();
  });

  /* ---------- Sound toggle ---------- */

  soundBtn.addEventListener('click', function () { setSound(!soundOn); });

  /* ---------- Sound off once the hero is scrolled past ---------- */

  var hero = document.querySelector('.hero');
  if (hero) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (soundOn && !entry.isIntersecting) setSound(false);
      });
    }, { threshold: 0.15 }).observe(hero);
  }

  /* ---------- Scroll reveals ---------- */

  function initReveals() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Data-driven sections ---------- */

  var tints = ['ph--a', 'ph--b', 'ph--c'];

  fetch('/data/weddings.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      // Featured weddings
      var grid = document.getElementById('homeWeddings');
      if (grid) {
        data.weddings.filter(function (w) { return w.featured; }).slice(0, 3).forEach(function (w, i) {
          var cover = (w.portfolio.photos && w.portfolio.photos[0]) || null;
          var a = document.createElement('a');
          a.className = 'wedding-card';
          a.href = '/weddings/' + w.slug + '/';
          a.innerHTML =
            (cover
              ? '<img class="wedding-card__img" src="' + cover.src + '" alt="' + cover.alt + '" loading="lazy" style="width:100%;aspect-ratio:4/5;object-fit:cover">'
              : '<div class="wedding-card__img ' + tints[i % 3] + '" role="img" aria-label="' + w.displayTitle + ' — ' + w.destination + '"></div>') +
            '<p class="wedding-card__caption">' + w.displayTitle + ' — <span>' + w.destination.split(',').pop().trim() + '</span></p>' +
            '<p class="wedding-card__origin">' + w.coupleOrigin + '</p>';
          grid.appendChild(a);
        });
      }
      // Journal cards
      var jgrid = document.getElementById('homeJournal');
      if (jgrid) {
        data.weddings.filter(function (w) { return w.journal && w.journal.published; }).slice(0, 3).forEach(function (w, i) {
          var photo = (w.journal.photos && w.journal.photos[0]) || (w.portfolio.photos && w.portfolio.photos[0]) || null;
          var a = document.createElement('a');
          a.className = 'jcard';
          a.href = '/journal/' + w.slug + '/';
          a.innerHTML =
            (photo
              ? '<img src="' + photo.src + '" alt="' + photo.alt + '" loading="lazy">'
              : '<div class="jcard__img ' + tints[i % 3] + '"></div>') +
            '<div class="jcard__k">Real Celebrations · ' + w.destination.split(',').pop().trim() + '</div>' +
            '<h3>' + w.journal.title + '</h3>' +
            '<p>' + w.journal.excerpt + '</p>';
          jgrid.appendChild(a);
        });
      }
    })
    .catch(function () {});

  fetch('/data/press.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var wrap = document.getElementById('pressLogos');
      if (!wrap) return;
      data.logos.slice(0, 6).forEach(function (name) {
        var s = document.createElement('span');
        s.textContent = name;
        wrap.appendChild(s);
      });
    })
    .catch(function () {});

  /* ---------- Keep the films efficient ---------- */

  document.querySelectorAll('.intro video, .hero video').forEach(function (v) {
    // The hidden variant (desktop film on mobile, reel on desktop) should not play
    if (getComputedStyle(v).display === 'none') {
      v.pause();
      v.removeAttribute('autoplay');
      v.preload = 'none';
      return;
    }
    // Pause the visible hero film when it leaves the viewport
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { v.play().catch(function () {}); }
        else { v.pause(); }
      });
    }, { threshold: 0.1 }).observe(v);
  });
})();
