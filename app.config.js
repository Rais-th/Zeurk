import 'dotenv/config';

export default {
  "expo": {
    "name": "Zeurk",
    "slug": "Zeurk",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#1a1a1a"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.Zeurk.app",
      "config": {
        "googleMapsApiKey": process.env.GOOGLE_MAPS_APIKEY
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1a1a1a"
      },
      "package": "com.Zeurk.app",
      "config": {
        "googleMaps": {
          "apiKey": process.env.GOOGLE_MAPS_APIKEY
        }
      },
      "notification": {
        "icon": "./assets/notification-icons/notification-icon-96.png",
        "color": "#FF9500",
        "androidCollapsedTitle": "Zeurk"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-web-browser",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow Zeurk to use your location."
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "L'application accède à vos photos pour vous permettre de changer votre photo de profil.",
          "cameraPermission": "L'application accède à votre appareil photo pour vous permettre de prendre une photo de profil."
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icons/notification-icon-96.png",
          "color": "#FF9500"
        }
      ]
      // Firebase configuration removed for Expo Go compatibility
      // Use web SDK instead of React Native Firebase
    ]
  }
}
