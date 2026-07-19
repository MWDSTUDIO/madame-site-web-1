/* L'Atelier — administration Madame Wedding Design.
   Ouvre le dossier local du site (File System Access API — Chrome/Edge),
   édite data/weddings.json, copie les photos et génère les pages. */

(function () {
  'use strict';

  var dirHandle = null;
  var data = null;          // contenu de data/weddings.json
  var currentSlug = null;   // mariage en cours d'édition (null = nouveau)
  var newPortfolio = [];    // File[] à copier au prochain enregistrement
  var newJournal = [];
  var edited = null;        // copie de travail du mariage

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- Ouverture du dossier ---------- */

  if (!window.showDirectoryPicker) {
    $('apiWarn').hidden = false;
    $('openBtn').disabled = true;
    $('openBtn2').disabled = true;
  }

  $('openBtn').addEventListener('click', openFolder);
  $('openBtn2').addEventListener('click', openFolder);

  function openFolder() {
    window.showDirectoryPicker({ mode: 'readwrite' }).then(function (h) {
      dirHandle = h;
      return readJSON('data/weddings.json').catch(function () {
        return { weddings: [] }; // site vierge — on initialisera le fichier
      });
    }).then(function (json) {
      data = json;
      $('gate').hidden = true;
      $('app').hidden = false;
      $('saveBtn').disabled = false;
      renderList();
      loadWedding(data.weddings.length ? data.weddings[0].slug : null);
    }).catch(function (e) {
      if (e && e.name !== 'AbortError') setStatus('Impossible d’ouvrir ce dossier : ' + e.message, true);
    });
  }

  /* ---------- Helpers fichiers ---------- */

  function getDir(path, create) {
    // path: 'a/b/c' → DirectoryHandle, en créant si demandé
    var parts = path.split('/').filter(Boolean);
    var p = Promise.resolve(dirHandle);
    parts.forEach(function (part) {
      p = p.then(function (d) { return d.getDirectoryHandle(part, { create: !!create }); });
    });
    return p;
  }

  function readJSON(path) {
    var parts = path.split('/');
    var file = parts.pop();
    return getDir(parts.join('/')).then(function (d) {
      return d.getFileHandle(file);
    }).then(function (fh) { return fh.getFile(); })
      .then(function (f) { return f.text(); })
      .then(function (t) { return JSON.parse(t); });
  }

  function writeFile(path, contents) {
    var parts = path.split('/');
    var file = parts.pop();
    return getDir(parts.join('/'), true).then(function (d) {
      return d.getFileHandle(file, { create: true });
    }).then(function (fh) { return fh.createWritable(); })
      .then(function (w) {
        return w.write(contents).then(function () { return w.close(); });
      });
  }

  function slugify(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function setStatus(msg, isErr) {
    ['status', 'status2'].forEach(function (id) {
      var el = $(id);
      el.textContent = msg;
      el.classList.toggle('err', !!isErr);
    });
  }

  /* ---------- Liste latérale ---------- */

  function renderList() {
    var ul = $('list');
    ul.innerHTML = '';
    data.weddings.forEach(function (w) {
      var li = document.createElement('li');
      li.className = w.slug === currentSlug ? 'active' : '';
      li.innerHTML = '<div class="t">' + (w.displayTitle || w.slug) + '</div>' +
                     '<div class="m">' + (w.destination || '') + (w.year ? ' · ' + w.year : '') + '</div>';
      li.addEventListener('click', function () { loadWedding(w.slug); });
      ul.appendChild(li);
    });
  }

  $('newBtn').addEventListener('click', function () { loadWedding(null); });

  /* ---------- Chargement du formulaire ---------- */

  function blankWedding() {
    return {
      slug: '', couple: '', displayTitle: '', venue: '', destination: '', country: '',
      year: new Date().getFullYear(), coupleOrigin: '', story: '', keywords: '', featured: false,
      portfolio: { photos: [] },
      journal: { published: false, title: '', excerpt: '', story: '', photos: [], press: [] }
    };
  }

  function loadWedding(slug) {
    currentSlug = slug;
    var w = slug ? data.weddings.find(function (x) { return x.slug === slug; }) : null;
    edited = JSON.parse(JSON.stringify(w || blankWedding()));
    newPortfolio = [];
    newJournal = [];

    $('w-couple').value = edited.couple || '';
    $('w-title').value = edited.displayTitle || '';
    $('w-venue').value = edited.venue || '';
    $('w-destination').value = edited.destination || '';
    $('w-country').value = edited.country || '';
    $('w-year').value = edited.year || '';
    $('w-origin').value = edited.coupleOrigin || '';
    $('w-slug').value = edited.slug || '';
    $('w-slug').disabled = !!slug; // le slug ne change plus après création (URL stable)
    $('w-story').value = edited.story || '';
    $('w-keywords').value = edited.keywords || '';
    $('w-featured').checked = !!edited.featured;
    $('j-published').checked = !!edited.journal.published;
    $('j-title').value = edited.journal.title || '';
    $('j-excerpt').value = edited.journal.excerpt || '';
    $('j-story').value = edited.journal.story || '';
    $('deleteBtn').hidden = !slug;

    renderThumbs();
    renderPress();
    renderList();
    setStatus(slug ? 'Édition : ' + (edited.displayTitle || slug) : 'Nouveau mariage');
  }

  // slug auto depuis le titre
  $('w-title').addEventListener('input', function () {
    if (!$('w-slug').disabled && !$('w-slug').dataset.touched) {
      $('w-slug').value = slugify($('w-title').value);
    }
  });
  $('w-slug').addEventListener('input', function () { this.dataset.touched = '1'; });

  /* ---------- Photos ---------- */

  function renderThumbs() {
    renderThumbSet('thumbs', edited.portfolio.photos, newPortfolio, 'portfolio');
    renderThumbSet('jthumbs', edited.journal.photos, newJournal, 'journal');
  }

  function renderThumbSet(elId, existing, pending, kind) {
    var box = $(elId);
    box.innerHTML = '';
    existing.forEach(function (p, i) {
      box.appendChild(thumb(p.src, kind + '-' + i, function () {
        existing.splice(i, 1);
        renderThumbs();
      }, false));
    });
    pending.forEach(function (f, i) {
      box.appendChild(thumb(URL.createObjectURL(f), 'new', function () {
        pending.splice(i, 1);
        renderThumbs();
      }, true));
    });
  }

  function thumb(src, label, onRemove, isNew) {
    var d = document.createElement('div');
    d.className = 'thumb';
    d.innerHTML = '<img src="' + src + '" alt="">' +
      (isNew ? '<span class="tag">nouveau</span>' : '') +
      '<button class="x" title="Retirer">×</button>';
    d.querySelector('.x').addEventListener('click', onRemove);
    return d;
  }

  var dz = $('dropzone');
  dz.addEventListener('click', function () { $('photoInput').click(); });
  dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('drag'); });
  dz.addEventListener('dragleave', function () { dz.classList.remove('drag'); });
  dz.addEventListener('drop', function (e) {
    e.preventDefault();
    dz.classList.remove('drag');
    addFiles(e.dataTransfer.files, newPortfolio);
  });
  $('photoInput').addEventListener('change', function () { addFiles(this.files, newPortfolio); this.value = ''; });
  $('jphotoBtn').addEventListener('click', function () { $('jphotoInput').click(); });
  $('jphotoInput').addEventListener('change', function () { addFiles(this.files, newJournal); this.value = ''; });

  function addFiles(files, target) {
    Array.prototype.slice.call(files).forEach(function (f) {
      if (f.type.indexOf('image/') === 0) target.push(f);
    });
    renderThumbs();
  }

  /* ---------- Presse ---------- */

  function renderPress() {
    var box = $('pressRows');
    box.innerHTML = '';
    edited.journal.press.forEach(function (p, i) {
      var row = document.createElement('div');
      row.className = 'press-row';
      row.innerHTML =
        '<div class="f" style="margin:0"><label>Média</label><input type="text" value="' + (p.name || '') + '"></div>' +
        '<div class="f" style="margin:0"><label>Lien</label><input type="url" value="' + (p.url || '') + '"></div>' +
        '<button class="btn ghost small" type="button">×</button>';
      var inputs = row.querySelectorAll('input');
      inputs[0].addEventListener('input', function () { p.name = this.value; });
      inputs[1].addEventListener('input', function () { p.url = this.value; });
      row.querySelector('button').addEventListener('click', function () {
        edited.journal.press.splice(i, 1);
        renderPress();
      });
      box.appendChild(row);
    });
  }

  $('pressBtn').addEventListener('click', function () {
    edited.journal.press.push({ name: '', url: '' });
    renderPress();
  });

  /* ---------- Enregistrement ---------- */

  $('saveBtn').addEventListener('click', save);
  $('saveBtn2').addEventListener('click', save);

  $('deleteBtn').addEventListener('click', function () {
    if (!currentSlug) return;
    if (!window.confirm('Retirer « ' + (edited.displayTitle || currentSlug) + ' » du site ?\n(Les photos et pages resteront dans le dossier ; seule la donnée est retirée.)')) return;
    data.weddings = data.weddings.filter(function (w) { return w.slug !== currentSlug; });
    writeFile('data/weddings.json', JSON.stringify(data, null, 2)).then(function () {
      setStatus('Mariage retiré. Pense à re-publier le site.');
      loadWedding(data.weddings.length ? data.weddings[0].slug : null);
    });
  });

  function collectForm() {
    edited.couple = $('w-couple').value.trim();
    edited.displayTitle = $('w-title').value.trim();
    edited.venue = $('w-venue').value.trim();
    edited.destination = $('w-destination').value.trim();
    edited.country = $('w-country').value.trim();
    edited.year = parseInt($('w-year').value, 10) || '';
    edited.coupleOrigin = $('w-origin').value.trim();
    edited.slug = $('w-slug').disabled ? edited.slug : slugify($('w-slug').value || $('w-title').value);
    edited.story = $('w-story').value.trim();
    edited.keywords = $('w-keywords').value.trim();
    edited.featured = $('w-featured').checked;
    edited.journal.published = $('j-published').checked;
    edited.journal.title = $('j-title').value.trim();
    edited.journal.excerpt = $('j-excerpt').value.trim();
    edited.journal.story = $('j-story').value.trim();
    edited.journal.press = edited.journal.press.filter(function (p) { return p.name || p.url; });
  }

  function altFor(w) {
    return (w.displayTitle + ' — ' + w.destination + ' — wedding by Madame Wedding Design').replace(/"/g, '');
  }

  function copyPhotos(w, files, kind, startIndex) {
    // Copie séquentielle des nouveaux fichiers vers assets/img/weddings/<slug>/<kind>/
    var base = 'assets/img/weddings/' + w.slug + '/' + kind;
    var p = Promise.resolve();
    files.forEach(function (f, i) {
      var name = String(startIndex + i + 1).padStart(2, '0') + '-' + slugify(f.name.replace(/\.[^.]+$/, '')) + f.name.match(/\.[^.]+$/)[0].toLowerCase();
      p = p.then(function () {
        return writeFile(base + '/' + name, f);
      }).then(function () {
        var target = kind === 'portfolio' ? w.portfolio.photos : w.journal.photos;
        target.push({ src: '/' + base + '/' + name, alt: altFor(w) });
      });
    });
    return p;
  }

  function save() {
    if (!dirHandle) return;
    collectForm();

    if (!edited.displayTitle || !edited.slug) {
      setStatus('Il manque au minimum le titre affiché (et donc le slug).', true);
      return;
    }

    setStatus('Enregistrement…');

    copyPhotos(edited, newPortfolio, 'portfolio', edited.portfolio.photos.length)
      .then(function () { return copyPhotos(edited, newJournal, 'journal', edited.journal.photos.length); })
      .then(function () {
        // Remplace ou ajoute dans les données
        var idx = data.weddings.findIndex(function (w) { return w.slug === (currentSlug || edited.slug); });
        if (idx >= 0) { data.weddings[idx] = edited; } else { data.weddings.push(edited); }
        return writeFile('data/weddings.json', JSON.stringify(data, null, 2));
      })
      .then(function () { return writeFile('weddings/' + edited.slug + '/index.html', weddingShell(edited)); })
      .then(function () {
        if (edited.journal.published) {
          return writeFile('journal/' + edited.slug + '/index.html', journalShell(edited));
        }
      })
      .then(function () {
        newPortfolio = [];
        newJournal = [];
        currentSlug = edited.slug;
        renderList();
        renderThumbs();
        $('w-slug').disabled = true;
        $('deleteBtn').hidden = false;
        setStatus('Enregistré ✓ — pages et photos écrites. Re-publie le site (Netlify ou git push).');
      })
      .catch(function (e) {
        setStatus('Erreur : ' + e.message, true);
      });
  }

  /* ---------- Gabarits de pages (identiques aux pages existantes) ---------- */

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  function shellHead(title, desc) {
    return '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
      '  <meta charset="UTF-8">\n' +
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '  <title>' + esc(title) + '</title>\n' +
      '  <meta name="description" content="' + esc(desc) + '">\n' +
      '  <link rel="icon" href="data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><text y=\'.9em\' font-size=\'90\' font-family=\'Georgia\'>M</text></svg>">\n' +
      '  <link rel="preconnect" href="https://fonts.googleapis.com">\n' +
      '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
      '  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">\n' +
      '  <link rel="stylesheet" href="/assets/css/main.css?v=4">\n' +
      '  <link rel="stylesheet" href="/assets/css/pages.css?v=4">\n' +
      '</head>\n<body class="page">\n';
  }

  function shellNav(active) {
    function cur(k) { return active === k ? ' aria-current="page"' : ''; }
    return '  <header class="nav nav--page">\n' +
      '    <a class="nav__logo" href="/">Madame Wedding Design</a>\n' +
      '    <nav class="nav__links" aria-label="Main navigation">\n' +
      '      <a href="/the-maison/">The Maison</a>\n' +
      '      <a href="/weddings/"' + cur('weddings') + '>Weddings</a>\n' +
      '      <a href="/services/">Services</a>\n' +
      '      <a href="/journal/"' + cur('journal') + '>The Journal</a>\n' +
      '      <a class="nav__inquire" href="/inquire/">Inquire</a>\n' +
      '    </nav>\n  </header>\n';
  }

  function shellFoot(script) {
    return '  <footer class="footer">\n' +
      '    <p>Madame Wedding Design — Full Wedding Planning Service &amp; Production</p>\n' +
      '    <p><a href="mailto:hello@madamewedding.design">hello@madamewedding.design</a></p>\n' +
      '  </footer>\n' +
      '  <script src="/assets/js/nav.js?v=4"><\/script>\n' +
      '  <script src="/assets/js/page.js?v=4"><\/script>\n' +
      '  <script src="/assets/js/' + script + '"><\/script>\n' +
      '</body>\n</html>\n';
  }

  function weddingShell(w) {
    var title = w.displayTitle + ', ' + w.destination + ' — Madame Wedding Design';
    var desc = 'A luxury wedding at ' + w.venue + ' in ' + w.destination + ', planned and produced by Madame Wedding Design.' + (w.coupleOrigin ? ' ' + w.coupleOrigin + '.' : '');
    return shellHead(title, desc) + shellNav('weddings') +
      '  <main data-wedding-slug="' + esc(w.slug) + '"></main>\n' + shellFoot('wedding-page.js');
  }

  function journalShell(w) {
    var title = w.journal.title + ' — The Journal — Madame Wedding Design';
    var desc = w.journal.excerpt || ('The story of a celebration in ' + w.destination + ' by Madame Wedding Design.');
    return shellHead(title, desc) + shellNav('journal') +
      '  <main data-journal-slug="' + esc(w.slug) + '"></main>\n' + shellFoot('journal-page.js');
  }
})();
