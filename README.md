# Madame Wedding Design — Wedding Planning & Production

Site statique multi-pages + application d'administration (« L'Atelier »).

## Déployer sur Netlify

- **Glisser-déposer** : [app.netlify.com/drop](https://app.netlify.com/drop) → glisse le dossier entier du projet.
- **Ou brancher le repo GitHub** (*Add new site → Import an existing project*) : chaque `git push` publie automatiquement. Recommandé.
- Domaine : brancher `madamewedding.design` dans *Site settings → Domain management*.

## Les pages (URL distinctes)

| URL | Page |
|---|---|
| `/` | Accueil — séquence d'ouverture « Enter », héro, portfolio, maison, services, presse, journal |
| `/maison/` | The Maison (About, paragraphe « citable » SEO/GEO) |
| `/weddings/` | Portfolio — tous les mariages |
| `/weddings/<slug>/` | Une page par mariage |
| `/services/` | Les trois accompagnements + FAQ (schema FAQPage) |
| `/journal/` | The Journal — récits + « As Seen In » (toute la presse) |
| `/journal/<slug>/` | Un article par mariage publié |
| `/inquire/` | Le formulaire en 5 étapes |
| `/admin/` | **L'Atelier** — administration (non indexé) |

## Le héro : photo sur desktop, film sur mobile

Le Reel vertical est parfait en plein écran mobile ; sur desktop c'est une photo.

| Fichier | Rôle |
|---|---|
| `assets/img/hero-photo.jpg` | **Photo du héro desktop** (provisoire : frame adoucie du film — remplace-la par ta vraie photo horizontale) |
| `assets/video/hero-film.mp4` | Le film (mobile), avec sa bande-son — lancée au clic « Enter » |
| `assets/video/hero-poster.jpg` | Image de chargement du film |
| `assets/audio/music.mp3` | Musique optionnelle — si présente, prioritaire sur le son du film |

Remplace les fichiers **en gardant les mêmes noms**, rien d'autre à toucher.

## Ajouter un mariage — L'Atelier (`/admin/`)

1. Ouvre `/admin/` dans **Chrome ou Edge** (en local : `python3 -m http.server` dans le dossier, puis `localhost:8000/admin/` — ou directement sur le site déployé).
2. « Ouvrir le dossier du site » → choisis le dossier du projet sur ton ordinateur.
3. Remplis la fiche du mariage : infos, **Portfolio** (8–12 photos) et **Journal** (récit, 3–5 photos, liens presse, case « Publier »).
4. « Enregistrer » : l'app copie les photos dans `assets/img/weddings/<slug>/…`, met à jour `data/weddings.json` et crée les pages `/weddings/<slug>/` et `/journal/<slug>/`.
5. Re-publie (drag & drop Netlify ou `git push`).

Toutes les listes (accueil, portfolio, journal) se mettent à jour automatiquement depuis `data/weddings.json`.

## Le formulaire Inquire

5 étapes (You → Celebration → Vision → Investment → Last word), validation douce, barre de progression.
**À faire une fois** : créer un compte gratuit sur [formspree.io](https://formspree.io), pointer vers
`hello@madamewedding.design`, puis coller l'endpoint dans `assets/js/inquire.js` :

```js
var FORMSPREE_ENDPOINT = 'https://formspree.io/f/xxxxxxx';
```

Tant qu'il n'est pas configuré, l'envoi ouvre le logiciel e-mail du visiteur, pré-rempli (solution de secours).

## Structure

```
index.html                  Accueil
maison/ services/ inquire/  Pages
weddings/  journal/         Index + une page par mariage / article
admin/                      L'Atelier (admin)
data/weddings.json          Tous les mariages (portfolio + journal)
data/press.json             Presse « As Seen In »
assets/css|js|img|video|audio
robots.txt sitemap.xml netlify.toml
```

## SEO / GEO

- Schema.org : Organization (accueil), AboutPage (maison), FAQPage (services), Article (journal).
- `robots.txt` ouvert à GPTBot, ClaudeBot, PerplexityBot, Google-Extended ; `/admin/` exclu.
- `sitemap.xml` — ajoute les nouvelles URLs quand tu crées un mariage (ou demande-moi de l'automatiser).
- TODO : `llms.txt`, pages destination (Weddings in Tuscany / Provence / Paris…) — étape suivante.
