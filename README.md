# MADAME — Wedding Design & Production

Site statique V1 — quiet luxury, prêt pour Netlify.

## Déployer sur Netlify (glisser-déposer)

1. Va sur [app.netlify.com/drop](https://app.netlify.com/drop)
2. Glisse **le dossier entier du projet** (pas un zip, pas un sous-dossier) dans la zone
3. C'est en ligne. Tu pourras ensuite brancher le domaine `madamewedding.design` dans
   *Site settings → Domain management*.

> Alternative : connecter ce repo GitHub à Netlify (*Add new site → Import an existing
> project*) — chaque `git push` redéploiera automatiquement le site.

## Remplacer la vidéo de test par ton vrai film

La vidéo actuelle (`assets/video/hero-film.mp4`) est un **placeholder généré** (dégradé
animé dans la palette du site) — uniquement pour tester la mécanique.

Pour mettre ton vrai film, remplace simplement les fichiers **en gardant les mêmes noms** :

| Fichier | Rôle | Conseils |
|---|---|---|
| `assets/video/hero-film.mp4` | Le film d'ouverture | H.264, ≤ 1080p, 15–40 s, ~6–10 Mo |
| `assets/video/hero-poster.jpg` | Image affichée pendant le chargement | Une belle frame du film |
| `assets/audio/music.mp3` | La musique (optionnelle) | Se lance au clic « Enter » ; si absente, le site reste silencieux |

Aucun code à modifier — juste remplacer les fichiers et re-glisser le dossier sur Netlify
(ou `git push` si le repo est connecté).

## Ajouter les photos

Dépose les photos dans `assets/img/` (un sous-dossier par mariage, ex.
`assets/img/sophie-gordon/`). Les cartes « Weddings » de la page d'accueil utilisent pour
l'instant des aplats de couleur — on les branchera sur tes vraies photos à l'étape suivante.

## Structure

```
index.html              Page d'accueil (séquence d'ouverture « Enter » + sections)
assets/css/main.css     Direction artistique (palette, typo, mouvements)
assets/js/main.js       Interactions (Enter, son, apparitions au scroll)
assets/video/           Film d'ouverture + poster
assets/audio/           Musique (music.mp3 — à ajouter)
assets/img/             Photos (à ajouter)
netlify.toml            Config Netlify (cache des médias)
robots.txt              Autorise Google + IA (GPTBot, ClaudeBot, PerplexityBot…)
```

## Prochaines étapes prévues

- Pages The Maison, Weddings (une page par mariage), Services, The Journal, Inquire
  (formulaire multi-étapes Formspree)
- Données dans `/data/*.json` pour ajouter un mariage ou une parution presse sans toucher
  au code
- `sitemap.xml`, `llms.txt`, schema.org par page (cf. `03-SEO-GEO-KEYWORD-MAP.md`)
