# Guide de Configuration SMS pour Zeurk

## Configuration Simple (Recommandée)

### 1. Variables d'environnement
Les clés Twilio sont déjà configurées dans le fichier `.env` :
```
TWILIO_ACCOUNT_SID=AC4426025540ca9073aac77b4b21e6860e
TWILIO_AUTH_TOKEN=82a77af221ff0a8a74b524bcd3c252a3
TWILIO_PHONE_NUMBER=+18447904199
```

### 2. Numéro SMS dans l'app
Le numéro est configuré dans `src/config/smsConfig.js` :
```javascript
TWILIO_NUMBER: '+18447904199'
```

### 2. Options de traitement des SMS

#### Option A: Service No-Code (Plus Simple)
1. **Zapier** ou **Make.com** :
   - Trigger: "Nouveau SMS reçu sur Twilio"
   - Action: "Envoyer notification push" ou "Webhook vers votre app"

#### Option B: Fonction Cloud Simple
1. **Vercel/Netlify Function** :
   - Webhook Twilio → Parse SMS → Notifier chauffeurs
   - Pas besoin de serveur dédié

#### Option C: Intégration directe
1. **Twilio Studio** :
   - Flow visuel pour traiter les SMS
   - Pas de code nécessaire

### 3. Workflow recommandé

```
Client SMS → Twilio → [Service de traitement] → Notification chauffeurs
```

### 4. Configuration Twilio
1. Configurez le webhook dans votre console Twilio
2. Pointez vers votre service de traitement
3. Testez avec un SMS

### 5. Format SMS supporté
- `Course Bandal vers Gombe 18h`
- `Course 4b avenue Uvira ref grand hotel vers Stade`
- `Course Ma position vers Aéroport 15h30`

## Avantages de cette approche
- ✅ Pas de backend complexe à maintenir
- ✅ Utilise vos clés Twilio existantes
- ✅ Déploiement rapide
- ✅ Coût minimal
- ✅ Scalable

## Prochaines étapes
1. Mettez votre numéro Twilio dans `smsConfig.js`
2. Choisissez votre option de traitement (A, B ou C)
3. Configurez le webhook Twilio
4. Testez le système