# Bot Twitch et Spotify en NodeJS

## Que fait ce bot ?
- Permet d'ajouter une musique à la file d'attente Spotify via les points de chaine
- Vous permet de rajouter facilement une gestion des points de chaine Twitch

## Comment le mettre en place ?

### Il vous faut :
- [Pnpm](https://pnpm.io/fr/) installé localement
- [Une base de donnée Firebase Realtime database](https://firebase.google.com/) et un certificat de compte de service
- [Un token pour le chatbot Twitch](https://twitchtokengenerator.com/) (Ce token est censé ne jamais expirer)
- [Un clientId et clientSecret Spotify](https://developer.spotify.com/dashboard/login)
- [Un clientId et clientSecret Twitch](https://dev.twitch.tv/)

#### A faire via la route ```/gettingstarted``` en automatisé ou à la main, au choix :)
##### 🔺 Si vous choisissez de ne pas le faire à la main, vous pouvez passez à l'étape suivante sinon il vous faut :
> - Un refresh token Spotify avec le scope ```user-modify-playback-state```
> - Un refresh token Twitch avec le scope ```channel:manage:redemptions```
> - Créer la récompense point de chaine avec votre client Id Twitch

## Ensuite ?

- Créez un fichier ```.env``` à la racine du projet en prenant exemple sur le ```.env.example```
- Remplissez toutes les informations necessaires dans le fichier ```.env```
- Remplissez les informations necessaires dans le fichier ```database.json``` et importez le dans votre base de données
- Lancez la commande ```pnpm dev```

##### Si vous n'avez pas encore de refresh token pour Spotify et Twitch :
- Ajouter en uri de callback sur Spotify votre adresse web suivi de ```/callback```
- Ajouter en uri de callback sur Twitch votre adresse web suivi de ```/callback```
- Rendez-vous sur la route ```/gettingstarted```
- Cliquez sur le token que vous voulez générer

### Bravo 🎉