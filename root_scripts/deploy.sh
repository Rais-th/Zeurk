#!/bin/bash

echo "🚀 Déploiement Zeurk Backend en Production"
echo "=========================================="

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI non trouvé. Installation..."
    npm install -g vercel
fi

# Vérifier les variables d'environnement locales
echo "🔍 Vérification des variables d'environnement..."

if [ -f .env ]; then
    source .env
    
    if [ -z "$TWILIO_ACCOUNT_SID" ] || [ -z "$TWILIO_AUTH_TOKEN" ] || [ -z "$OPENROUTER_API_KEY" ]; then
        echo "⚠️  Variables manquantes dans .env"
        echo "Assurez-vous d'avoir :"
        echo "- TWILIO_ACCOUNT_SID"
        echo "- TWILIO_AUTH_TOKEN"
        echo "- TWILIO_PHONE_NUMBER"
        echo "- OPENROUTER_API_KEY"
        exit 1
    fi
    
    echo "✅ Variables d'environnement OK"
else
    echo "❌ Fichier .env non trouvé"
    exit 1
fi

# Test local avant déploiement
echo "🧪 Test du backend local..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend local fonctionne"
else
    echo "⚠️  Backend local non accessible (normal si arrêté)"
fi

# Déploiement
echo "📦 Déploiement sur Vercel..."
vercel --prod

echo ""
echo "🎉 Déploiement terminé !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Notez l'URL de production fournie par Vercel"
echo "2. Configurez le webhook Twilio avec cette URL + /api/sms"
echo "3. Testez avec : curl https://votre-url.vercel.app/health"
echo ""
echo "📱 Pour tester les SMS :"
echo "curl https://votre-url.vercel.app/api/driver/stats"