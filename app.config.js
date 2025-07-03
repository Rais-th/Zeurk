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
      ]
    ]
  }
}
