# Déployer Junior's Finance en gratuit

L'app est prête à être déployée sur un hébergeur gratuit. Voici deux options simples.

---

## Option 1 : Vercel (recommandé pour Next.js)

1. **Pousser le code sur GitHub** (si ce n’est pas déjà fait) :
   ```bash
   git add .
   git commit -m "App prête pour déploiement"
   git push origin master
   ```

2. **Créer un compte** sur [vercel.com](https://vercel.com) (connexion avec GitHub possible).

3. **Importer le projet** :
   - Cliquer sur **Add New…** → **Project**
   - Choisir le dépôt **JuniorsAPP**
   - Vercel détecte Next.js automatiquement → **Deploy**

4. **Résultat** : une URL du type `https://juniors-app-xxx.vercel.app`.

**Limites gratuites (plan Hobby)** : usage personnel, nombreuses requêtes/mois, pas de carte bancaire requise.

---

## Option 2 : Netlify

1. **Pousser le code sur GitHub** (comme ci-dessus).

2. **Créer un compte** sur [netlify.com](https://netlify.com).

3. **Importer le projet** :
   - **Add new site** → **Import an existing project** → **GitHub** → choisir **JuniorsAPP**
   - Paramètres de build :
     - **Build command** : `npm run build`
     - **Publish directory** : `.next` (laisser Netlify gérer)  
     En fait, pour Next.js sur Netlify, utiliser **“Next.js”** dans la liste des frameworks : Netlify remplit tout.

4. **Deploy** : Netlify build et déploie. Vous obtenez une URL du type `https://xxx.netlify.app`.

---

## En local avant de déployer

```bash
# Installer les dépendances
npm install

# Lancer en dev
npm run dev

# Tester le build (obligatoire pour Vercel/Netlify)
npm run build
```

Si `npm run build` réussit, le déploiement fonctionnera.

---

## Rappel

Les données (transactions) sont stockées dans le **localStorage** du navigateur. Elles restent sur l’appareil de l’utilisateur et ne sont pas synchronisées entre appareils ni sauvegardées sur le serveur.
