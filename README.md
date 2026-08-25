# CalcBox — convertisseurs & calculateurs, site statique

Aucune dépendance, aucun build, aucune clé API, aucun abonnement. Fichiers :
`index.html`, `styles.css`, `app.js`, `robots.txt`, `sitemap.xml`, `ads.txt`.
Tout tourne dans le navigateur du visiteur.

## Lancer en local

Double-cliquez sur `index.html`, ou :

```bash
python3 -m http.server 8000
```

puis ouvrez http://localhost:8000

## Déployer (gratuit, 2 minutes)

- **Netlify / Vercel** : glissez le dossier sur l'interface de déploiement, aucune config.
- **GitHub Pages** : poussez ces fichiers dans un repo, activez Pages.
- **Cloudflare Pages** : identique à Netlify.

Aucune variable d'environnement, aucune base de données, aucun backend à héberger.

## ⚠️ 3 choses à remplacer avant mise en ligne

Le site est câblé pour le SEO et la monétisation, mais 3 valeurs sont des
placeholders génériques — cherchez-les et remplacez-les :

1. **Ton domaine réel.** `https://www.calcbox.example/` apparaît dans
   `index.html` (canonical, Open Graph), `robots.txt` et `sitemap.xml`.
   Remplace par ton vrai nom de domaine partout.
2. **Ton ID éditeur AdSense** (`ca-pub-0000000000000000` / `pub-0000000000000000`).
   Apparaît dans `index.html` (script `<head>` + 3 encarts `<ins class="adsbygoogle">`)
   et dans `ads.txt`. Tu l'obtiens en créant un compte sur
   https://www.google.com/adsense (gratuit, validation par Google sous
   quelques jours, nécessite un peu de trafic/contenu). Sans cette étape,
   le script reste inactif et n'affiche rien — il ne casse rien.
3. **Ton lien de don** : `https://ko-fi.com/VOTRE-PSEUDO` (bouton "☕ Soutenir
   CalcBox" en haut et en bas de page). Crée un compte gratuit sur
   https://ko-fi.com (ou remplace par un lien PayPal.me) et colle ton lien.

## Monétisation mise en place

Deux mécanismes, tous deux sans rien vendre :

- **Publicité display (Google AdSense)** — 3 emplacements déjà posés dans la
  page (après le hero, au milieu, en bas), avec le script de chargement et
  `ads.txt` prêt. C'est la source de revenus principale une fois le trafic
  établi : rémunération à l'affichage/au clic, zéro action du visiteur requise.
- **Don libre (Ko-fi)** — un lien discret en header/footer pour les visiteurs
  qui veulent soutenir le site volontairement. Complémentaire, pas une
  dépendance : la plupart des visiteurs ne l'utiliseront pas, mais ça ne coûte
  rien à avoir.

D'autres pistes existent (Ezoic/Monumetric comme alternatives à AdSense avec
des seuils de trafic différents, Brave/Web Monetization), mais elles demandent
toutes la création d'un compte externe — impossible à faire à ta place ici.

## SEO mis en place

- **Contenu ciblant les recherches réelles** : un bloc statique de décalages
  horaires courants (Paris/Tokyo, Paris/New York, etc.) sous l'outil fuseaux
  horaires, + une FAQ `<details>` sous chaque outil, répondant directement
  aux questions du type "combien d'heures de décalage entre Paris et Tokyo",
  "comment calculer la TVA", "1 kg en livres"... Tout ce texte est lisible par
  Google sans exécuter de JavaScript.
- **Données structurées (JSON-LD)** : schéma `WebApplication` (site) et
  `FAQPage` (les questions ci-dessus) — permet à Google d'afficher des
  extraits enrichis (accordéons FAQ) directement dans les résultats.
- **Meta tags complets** : title et description reformulés autour des
  requêtes cibles, Open Graph + Twitter Card pour un bel aperçu au partage,
  balise canonical, `theme-color`.
- **`robots.txt` + `sitemap.xml`** pour guider l'indexation.
- **Ancres par outil** (`#tz`, `#unit`...) : chaque outil est directement
  lien-able, ce qui permet à Google d'orienter un internaute vers la bonne
  section précise.

Pour aller plus loin une fois le trafic établi : créer une page dédiée par
paire de villes (`/decalage-horaire-paris-tokyo`) capterait beaucoup plus de
trafic long-traîne qu'une seule page — mais cela suppose de sortir du site
mono-page actuel (plusieurs fichiers HTML ou un petit générateur).

## Outils inclus

1. Convertisseur d'unités (longueur, poids, volume, température)
2. Calculateur d'IMC
3. Pourcentages (proportion + variation)
4. Calculateur de prêt (mensualités, coût total)
5. Calculateur d'âge
6. Calculateur de TVA (HT ↔ TTC)
7. Pourboire & partage d'addition
8. Différence entre deux dates
9. Fuseaux horaires (heure dans le monde)
10. Intérêts composés (simulation d'épargne)

## Ajouter un calculateur

Dupliquez une `<section class="tool">` dans `index.html`, ajoutez l'entrée dans
`.panel-grid`, et la fonction JS associée dans `app.js`. Pensez à ajouter une
FAQ `<details class="faq">` ciblant les questions réelles des internautes sur
ce calcul — c'est ce qui capte le trafic de recherche.
