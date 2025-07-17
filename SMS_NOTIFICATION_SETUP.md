# Configuration Twilio pour SMS → Notification

## 🔧 Configuration Backend

### 1. Démarrer le serveur backend
```bash
npm run server
```
Le serveur démarre sur `http://localhost:3001`

### 2. Tester le backend
```bash
npm run test:backend
```

## 📱 Configuration Twilio

### 1. Webhook URL
Dans votre console Twilio, configurez le webhook pour votre numéro :
```
http://localhost:3001/api/sms
```

**Pour la production**, utilisez ngrok ou déployez sur un serveur :
```bash
# Avec ngrok (pour test local)
ngrok http 3001
# Utilisez l'URL ngrok dans Twilio
```

### 2. Variables d'environnement
Vérifiez que votre `.env` contient :
```env
TWILIO_ACCOUNT_SID=AC4426025540ca9073aac77b4b21e6860e
TWILIO_AUTH_TOKEN=82a77af221ff0a8a74b524bcd3c252a3
TWILIO_PHONE_NUMBER=+18447904199
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
```

## 🚗 Configuration App Mobile

### 1. Activer le mode chauffeur
1. Ouvrir l'app Zeurk
2. Aller dans **Tableau de bord** → **Paramètres**
3. Activer **"Notifications SMS"**
4. Le token sera automatiquement envoyé au backend

### 2. Tester les notifications
1. Dans les paramètres, appuyer sur **"Tester une notification"**
2. Ou envoyer un SMS au numéro Twilio : `+18447904199`

## 📋 Flow de test complet

### Test 1: Simulation locale
```
App → Paramètres → Tester une notification
```

### Test 2: SMS réel
```
1. Activer le mode chauffeur dans l'app
2. Envoyer SMS à +18447904199 :
   "Course Bandal vers Gombe 18h"
3. Recevoir notification sur l'app
```

## 🔍 Debugging

### Vérifier les logs backend
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: App
npm start
```

### Endpoints de debug
- Health: `http://localhost:3001/health`
- Stats: `http://localhost:3001/api/driver/stats`
- Tokens: `http://localhost:3001/api/driver/tokens`

### Logs à surveiller
- ✅ Driver registered: [token]
- 📱 Sending notifications to X drivers
- ✅ Sent X notifications

## ⚠️ Problèmes courants

### 1. Pas de notification reçue
- Vérifier que le mode chauffeur est activé
- Vérifier les permissions de notification
- Vérifier que le backend tourne
- Vérifier les logs du serveur

### 2. Erreur de parsing SMS
- Vérifier la clé OpenRouter API
- Tester avec des formats simples : "Course [origine] vers [destination]"

### 3. Webhook Twilio ne fonctionne pas
- Vérifier l'URL du webhook dans Twilio
- Utiliser ngrok pour exposer localhost
- Vérifier les logs du serveur

## 🚀 Production

Pour la production :
1. Déployer le backend sur Heroku/Vercel/AWS
2. Configurer l'URL de production dans Twilio
3. Mettre à jour `BACKEND_URL` dans `driverTokenService.js`
4. Configurer une vraie base de données pour les tokens