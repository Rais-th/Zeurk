# Implémentation des Notifications Push pour SMS

## 🎯 Objectif
Recevoir une notification dans l'app après qu'un client envoie un SMS de commande.

## 📋 Étapes Nécessaires

### 1. Installation des Dépendances
```bash
npx expo install expo-notifications expo-device expo-constants
```

### 2. Configuration Expo Notifications
```javascript
// src/services/notificationService.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

### 3. Enregistrement du Token Push
```javascript
// Obtenir le token de notification
export async function registerForPushNotificationsAsync() {
  let token;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
  }

  return token;
}
```

### 4. Backend - Envoi de Notifications
```javascript
// api/notifications.js
const { Expo } = require('expo-server-sdk');

const expo = new Expo();

export async function sendPushNotification(pushToken, rideData) {
  const message = {
    to: pushToken,
    sound: 'default',
    title: '🚗 Nouvelle Course SMS',
    body: `${rideData.from} → ${rideData.to}`,
    data: { 
      type: 'sms_ride_request',
      rideData: rideData 
    },
  };

  try {
    const ticket = await expo.sendPushNotificationsAsync([message]);
    console.log('Notification envoyée:', ticket);
  } catch (error) {
    console.error('Erreur notification:', error);
  }
}
```

### 5. Mise à jour API SMS
```javascript
// Dans api/sms.js - après parsing du SMS
const rideData = await parseRideRequest(smsText, clientPhone);

if (rideData.isValid) {
  // Trouver chauffeurs disponibles
  const availableDrivers = await findAvailableDrivers(rideData);
  
  // Envoyer notifications push
  for (const driver of availableDrivers) {
    if (driver.pushToken) {
      await sendPushNotification(driver.pushToken, rideData);
    }
  }
}
```

### 6. Gestion des Notifications dans l'App
```javascript
// Dans App.js ou composant principal
useEffect(() => {
  // Écouter les notifications reçues
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification reçue:', notification);
  });

  // Écouter les clics sur notifications
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    const { type, rideData } = response.notification.request.content.data;
    
    if (type === 'sms_ride_request') {
      // Naviguer vers l'écran de course
      navigation.navigate('RideRequest', { rideData });
    }
  });

  return () => {
    subscription.remove();
    responseSubscription.remove();
  };
}, []);
```

## 🚀 Flux Complet Implémenté

```
1. Client SMS → "Course Bandal vers Gombe 18h"
2. Twilio → Webhook vers api/sms.js
3. IA Parse → { from: "Bandal", to: "Gombe", time: "18h" }
4. Trouve chauffeurs → Base de données
5. Envoie notifications → Expo Push Service
6. Chauffeur reçoit → Notification sur téléphone
7. Clic notification → Ouvre app sur course
```

## ⚡ Version Simplifiée (Test Rapide)

Pour tester rapidement sans backend complet :

1. **Simuler la notification** dans l'app
2. **Webhook simple** qui envoie juste une notification
3. **Test local** avec Expo Go

## 🔧 Prochaines Étapes

1. Installer expo-notifications
2. Configurer les permissions
3. Créer le service de notifications
4. Tester avec une notification locale
5. Intégrer avec l'API SMS