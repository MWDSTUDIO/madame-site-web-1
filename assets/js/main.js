/* MADAME — interactions: the threshold, sound, reveals. */

(function () {
  const intro = document.getElementById('intro');
  const site = document.getElementById('site');
  const enterBtn = document.getElementById('enterBtn');
  const soundBtn = document.getElementById('soundBtn');
  const music = document.getElementById('music');
  const siteVideo = document.getElementById('siteVideo');

  let soundOn = false;
  let musicAvailable = null; // unknown until first play attempt

  /* ---------- Enter — the user gesture that unlocks sound ---------- */

  enterBtn.addEventListener('click', function () {
    site.hidden = false;

    // Try to start the music (only works if assets/audio/music.mp3 exists).
    music.play().then(function () {
      musicAvailable = true;
      soundOn = true;
      soundBtn.hidden = false;
      soundBtn.setAttribute('aria-pressed', 'true');
    }).catch(function () {
      // No music file yet — the site stays elegantly silent.
      musicAvailable = false;
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

  soundBtn.addEventListener('click', function () {
    if (!musicAvailable) return;
    soundOn = !soundOn;
    if (soundOn) { music.play(); } else { music.pause(); }
    soundBtn.setAttribute('aria-pressed', String(soundOn));
  });

  /* ---------- Fade music out once the hero is scrolled past ---------- */

  const heroObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!musicAvailable || !soundOn) return;
      if (!entry.isIntersecting) {
        music.pause();
        soundBtn.setAttribute('aria-pressed', 'false');
        soundOn = false;
      }
    });
  }, { threshold: 0.15 });

  const hero = document.querySelector('.hero');
  if (hero) heroObserver.observe(hero);

  /* ---------- Scroll reveals ---------- */

  function initReveals() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Keep videos quiet & efficient ---------- */

  // Pause the in-page hero video when it leaves the viewport (battery/data).
  if (siteVideo) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { siteVideo.play().catch(function () {}); }
        else { siteVideo.pause(); }
      });
    }, { threshold: 0.1 }).observe(siteVideo);
  }
})();
