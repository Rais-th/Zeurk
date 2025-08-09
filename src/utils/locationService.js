import * as Location from 'expo-location';
import { GOOGLE_MAPS_APIKEY } from '@env';
import { firestore, COLLECTIONS } from '../config/firebase';
import { doc, setDoc, onSnapshot, query, where, collection, serverTimestamp, getDocs, orderBy } from 'firebase/firestore';

/**
 * Enhanced Location Service for Zeurk
 * Integrates GPS, Geolocation API, Routes API, and Distance Matrix API
 * Optimized for Kinshasa's urban environment
 */
class LocationService {
  constructor() {
    this.lastKnownLocation = null;
    this.locationCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get current location with fallback strategy
   * 1. Try GPS first (most accurate)
   * 2. Fall back to Geolocation API (cell towers + WiFi)
   * 3. Use last known location as final fallback
   */
  async getCurrentLocation(options = {}) {
    const { timeout = 10000, enableHighAccuracy = true, fallbackToGeolocation = true } = options;

    try {
      // First, try to get GPS location
      const gpsLocation = await this.getGPSLocation(timeout, enableHighAccuracy);
      if (gpsLocation) {
        this.lastKnownLocation = gpsLocation;
        return {
          ...gpsLocation,
          source: 'gps',
          accuracy: 'high'
        };
      }
    } catch (error) {
      console.log('GPS failed, trying fallback methods:', error.message);
    }

    // If GPS fails and fallback is enabled, try Geolocation API
    if (fallbackToGeolocation) {
      try {
        const geolocationResult = await this.getGeolocationAPILocation();
        if (geolocationResult) {
          this.lastKnownLocation = geolocationResult;
          return {
            ...geolocationResult,
            source: 'geolocation_api',
            accuracy: 'medium'
          };
        }
      } catch (error) {
        console.log('Geolocation API failed:', error.message);
      }
    }

    // Final fallback to last known location
    if (this.lastKnownLocation) {
      return {
        ...this.lastKnownLocation,
        source: 'cached',
        accuracy: 'low'
      };
    }

    throw new Error('Unable to determine location');
  }

  /**
   * Get GPS location using Expo Location
   */
  async getGPSLocation(timeout = 10000, enableHighAccuracy = true) {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: enableHighAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
      timeout,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: Date.now()
    };
  }

  /**
   * Get location using Google Geolocation API (cell towers + WiFi)
   * Useful when GPS is unavailable or inaccurate
   */
  async getGeolocationAPILocation() {
    try {
      const response = await fetch(
        `https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_MAPS_APIKEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            considerIp: true,
            // Note: For better accuracy, you could add cell tower and WiFi data
            // This basic implementation uses IP-based geolocation
          }),
        }
      );

      const data = await response.json();
      
      if (data.location) {
        return {
          latitude: data.location.lat,
          longitude: data.location.lng,
          accuracy: data.accuracy || 1000, // Default to 1km accuracy
          timestamp: Date.now()
        };
      }
      
      throw new Error('No location data received');
    } catch (error) {
      console.error('Geolocation API error:', error);
      throw error;
    }
  }

  /**
   * Enhanced route calculation using Routes API
   * More performant than Directions API
   */
  async getOptimizedRoute(origin, destination, waypoints = [], options = {}) {
    const {
      travelMode = 'DRIVE',
      routeModifiers = {},
      computeAlternativeRoutes = false,
      languageCode = 'fr'
    } = options;

    try {
      const requestBody = {
        origin: {
          location: {
            latLng: {
              latitude: origin.latitude,
              longitude: origin.longitude
            }
          }
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.latitude,
              longitude: destination.longitude
            }
          }
        },
        travelMode,
        routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
        computeAlternativeRoutes,
        routeModifiers: {
          avoidTolls: false,
          avoidHighways: false,
          avoidFerries: true,
          ...routeModifiers
        },
        languageCode,
        units: 'METRIC'
      };

      // Add waypoints if provided
      if (waypoints.length > 0) {
        requestBody.intermediates = waypoints.map(waypoint => ({
          location: {
            latLng: {
              latitude: waypoint.latitude,
              longitude: waypoint.longitude
            }
          }
        }));
      }

      const response = await fetch(
        `https://routes.googleapis.com/directions/v2:computeRoutes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_MAPS_APIKEY,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.duration,routes.legs.distanceMeters'
          },
          body: JSON.stringify(requestBody)
        }
      );

      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          duration: route.duration,
          distance: route.distanceMeters,
          polyline: route.polyline.encodedPolyline,
          legs: route.legs,
          source: 'routes_api'
        };
      }
      
      throw new Error('No routes found');
    } catch (error) {
      console.error('Routes API error:', error);
      // Fallback to Directions API if Routes API fails
      return this.getDirectionsAPIRoute(origin, destination, waypoints);
    }
  }

  /**
   * Fallback to Directions API if Routes API fails
   */
  async getDirectionsAPIRoute(origin, destination, waypoints = []) {
    try {
      const waypointsParam = waypoints.length > 0 
        ? `&waypoints=${waypoints.map(w => `${w.latitude},${w.longitude}`).join('|')}`
        : '';

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}${waypointsParam}&key=${GOOGLE_MAPS_APIKEY}&language=fr&departure_time=now&traffic_model=best_guess`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        let totalDuration = 0;
        let totalDistance = 0;

        route.legs.forEach(leg => {
          totalDuration += leg.duration_in_traffic ? leg.duration_in_traffic.value : leg.duration.value;
          totalDistance += leg.distance.value;
        });

        return {
          duration: `${totalDuration}s`,
          distance: totalDistance,
          polyline: route.overview_polyline.points,
          legs: route.legs,
          source: 'directions_api'
        };
      }
      
      throw new Error('No routes found');
    } catch (error) {
      console.error('Directions API fallback error:', error);
      throw error;
    }
  }

  /**
   * Find nearest drivers using Distance Matrix API
   * Perfect for driver-rider matching
   */
  async findNearestDrivers(riderLocation, driverLocations, maxDrivers = 10) {
    if (driverLocations.length === 0) {
      return [];
    }

    try {
      // Limit to 25 destinations per request (API limit)
      const chunkedDrivers = this.chunkArray(driverLocations, 25);
      const allResults = [];

      for (const driverChunk of chunkedDrivers) {
        const origins = `${riderLocation.latitude},${riderLocation.longitude}`;
        const destinations = driverChunk
          .map(driver => `${driver.latitude},${driver.longitude}`)
          .join('|');

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${GOOGLE_MAPS_APIKEY}&mode=driving&language=fr&departure_time=now&traffic_model=best_guess`
        );

        const data = await response.json();
        
        if (data.rows && data.rows[0] && data.rows[0].elements) {
          const elements = data.rows[0].elements;
          
          elements.forEach((element, index) => {
            if (element.status === 'OK') {
              const driver = driverChunk[index];
              allResults.push({
                ...driver,
                distance: element.distance,
                duration: element.duration_in_traffic || element.duration,
                distanceValue: element.distance.value,
                durationValue: (element.duration_in_traffic || element.duration).value
              });
            }
          });
        }
      }

      // Sort by duration (fastest first) and return top results
      return allResults
        .sort((a, b) => a.durationValue - b.durationValue)
        .slice(0, maxDrivers);

    } catch (error) {
      console.error('Distance Matrix API error:', error);
      // Fallback to simple distance calculation
      return this.calculateStraightLineDistances(riderLocation, driverLocations, maxDrivers);
    }
  }

  /**
   * Fallback distance calculation using straight-line distance
   */
  calculateStraightLineDistances(riderLocation, driverLocations, maxDrivers = 10) {
    const driversWithDistance = driverLocations.map(driver => {
      const distance = this.calculateHaversineDistance(
        riderLocation.latitude,
        riderLocation.longitude,
        driver.latitude,
        driver.longitude
      );
      
      return {
        ...driver,
        distance: { text: `${distance.toFixed(1)} km`, value: distance * 1000 },
        duration: { text: `${Math.round(distance * 2)} min`, value: distance * 120 }, // Rough estimate
        distanceValue: distance * 1000,
        durationValue: distance * 120
      };
    });

    return driversWithDistance
      .sort((a, b) => a.distanceValue - b.distanceValue)
      .slice(0, maxDrivers);
  }

  /**
   * Calculate straight-line distance between two points using Haversine formula
   */
  calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Split array into chunks
   */
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Clear location cache
   */
  clearCache() {
    this.locationCache.clear();
  }

  /**
   * Get cached location if available and not expired
   */
  getCachedLocation(key) {
    const cached = this.locationCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Cache location data
   */
  setCachedLocation(key, data) {
    this.locationCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // ========================================
  // CONGO OPTIMIZED: Real-time Driver Detection
  // Lightweight, offline-first, minimal data
  // ========================================

  /**
   * DRIVER: Update position in Firebase (Congo optimized)
   * Minimal data, 30s intervals, compression
   */
  async updateDriverPosition(driverId, isAvailable = true) {
    try {
      const location = await this.getCurrentLocation({ timeout: 5000 });
      
      // MINIMAL data structure for Congo
      const driverData = {
        lat: Math.round(location.latitude * 100000) / 100000, // 5 decimals = ~1m precision
        lng: Math.round(location.longitude * 100000) / 100000,
        av: isAvailable ? 1 : 0, // available (compressed)
        ts: serverTimestamp() // timestamp
      };

      await setDoc(doc(firestore, COLLECTIONS.DRIVERS_LIVE, driverId), driverData);
      return true;
    } catch (error) {
      console.error('Driver position update failed:', error);
      return false;
    }
  }

  /**
   * PASSENGER: Listen to nearby drivers (Congo optimized)
   * Real-time listener with minimal data transfer
   */
  listenToNearbyDrivers(passengerLocation, radiusKm = 5, callback) {
    try {
      // Simple query - all available drivers
      const driversQuery = query(
        collection(firestore, COLLECTIONS.DRIVERS_LIVE),
        where('av', '==', 1) // only available drivers
      );

      const unsubscribe = onSnapshot(driversQuery, (snapshot) => {
        const nearbyDrivers = [];
        
        snapshot.forEach((doc) => {
          const driver = doc.data();
          const distance = this.calculateHaversineDistance(
            passengerLocation.latitude,
            passengerLocation.longitude,
            driver.lat,
            driver.lng
          );

          // Filter by radius
          if (distance <= radiusKm) {
            nearbyDrivers.push({
              id: doc.id,
              latitude: driver.lat,
              longitude: driver.lng,
              available: driver.av === 1,
              distance: distance,
              timestamp: driver.ts
            });
          }
        });

        // Sort by distance
        nearbyDrivers.sort((a, b) => a.distance - b.distance);
        callback(nearbyDrivers);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Driver listener failed:', error);
      callback([]);
      return () => {}; // Return empty unsubscribe function
    }
  }

  /**
   * DRIVER: Start position tracking (Congo optimized)
   * 30-second intervals, battery optimized
   */
  startDriverTracking(driverId, isAvailable = true) {
    // Clear any existing interval
    if (this.driverTrackingInterval) {
      clearInterval(this.driverTrackingInterval);
    }

    // Update immediately
    this.updateDriverPosition(driverId, isAvailable);

    // Then update every 30 seconds (Congo optimized)
    this.driverTrackingInterval = setInterval(() => {
      this.updateDriverPosition(driverId, isAvailable);
    }, 30000); // 30 seconds

    return this.driverTrackingInterval;
  }

  /**
   * DRIVER: Stop position tracking
   */
  stopDriverTracking(driverId) {
    if (this.driverTrackingInterval) {
      clearInterval(this.driverTrackingInterval);
      this.driverTrackingInterval = null;
    }

    // Remove from live collection
    try {
      setDoc(doc(firestore, COLLECTIONS.DRIVERS_LIVE, driverId), {
        av: 0, // Set as unavailable
        ts: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to stop tracking:', error);
    }
  }

  /**
   * PASSENGER: Get nearest drivers (one-time fetch)
   * For initial load or manual refresh
   */
  async getNearestDrivers(passengerLocation, radiusKm = 5, maxDrivers = 10) {
    try {
      const driversQuery = query(
        collection(firestore, COLLECTIONS.DRIVERS_LIVE),
        where('av', '==', 1)
      );

      const snapshot = await getDocs(driversQuery);
      const nearbyDrivers = [];

      snapshot.forEach((doc) => {
        const driver = doc.data();
        const distance = this.calculateHaversineDistance(
          passengerLocation.latitude,
          passengerLocation.longitude,
          driver.lat,
          driver.lng
        );

        if (distance <= radiusKm) {
          nearbyDrivers.push({
            id: doc.id,
            lat: driver.lat,
            lng: driver.lng,
            latitude: driver.lat,
            longitude: driver.lng,
            available: driver.av === 1,
            distance: distance,
            timestamp: driver.ts
          });
        }
      });

      return nearbyDrivers
        .sort((a, b) => a.distance - b.distance)
        .slice(0, maxDrivers);

    } catch (error) {
      console.error('Failed to get nearest drivers:', error);
      return [];
    }
  }

  /**
   * PASSENGER: Get ALL available drivers (for demo mode)
   * Used when no drivers are found locally
   */
  async getAllAvailableDrivers() {
    try {
      console.log('🌍 Récupération de TOUS les chauffeurs disponibles...');
      
      const driversQuery = query(
        collection(firestore, COLLECTIONS.DRIVERS_LIVE),
        where('av', '==', 1)
      );

      const snapshot = await getDocs(driversQuery);
      const allDrivers = [];

      snapshot.forEach((doc) => {
        const driver = doc.data();
        allDrivers.push({
          id: doc.id,
          lat: driver.lat,
          lng: driver.lng,
          latitude: driver.lat, // Alias pour compatibilité
          longitude: driver.lng, // Alias pour compatibilité
          available: driver.av === 1,
          distance: 999, // Distance arbitraire pour mode démo
          timestamp: driver.ts,
          isDemoMode: true // Marqueur pour indiquer le mode démo
        });
      });

      console.log(`✅ ${allDrivers.length} chauffeurs trouvés en mode démo`);
      return allDrivers;

    } catch (error) {
      console.error('❌ Échec récupération tous chauffeurs:', error);
      return [];
    }
  }

  /**
   * PASSENGER: Enhanced real-time listener with optimized performance
   * Système temps réel amélioré pour une meilleure réactivité
   */
  listenToNearbyDriversEnhanced(passengerLocation, radiusKm = 5, callback) {
    try {
      console.log(`🚀 Démarrage listener temps réel optimisé (rayon: ${radiusKm}km)`);
      
      // Query optimisé pour Firebase avec index sur 'av' et 'ts'
      const driversQuery = query(
        collection(firestore, COLLECTIONS.DRIVERS_LIVE),
        where('av', '==', 1), // Seulement chauffeurs disponibles
        orderBy('ts', 'desc') // Trier par timestamp pour avoir les plus récents
      );

      // Cache local pour éviter les recalculs inutiles
      let lastDriversSnapshot = new Map();
      let lastUpdateTime = 0;

      const unsubscribe = onSnapshot(driversQuery, (snapshot) => {
        const currentTime = Date.now();
        
        // Éviter les mises à jour trop fréquentes (minimum 2 secondes)
        if (currentTime - lastUpdateTime < 2000 && snapshot.size === lastDriversSnapshot.size) {
          return;
        }
        
        const drivers = [];
        const changes = [];
        let totalDrivers = 0;
        
        snapshot.docChanges().forEach((change) => {
          const driver = change.doc.data();
          const driverId = change.doc.id;
          
          // Traquer les changements pour optimiser les mises à jour
          if (change.type === 'added') {
            changes.push({ type: 'added', id: driverId, data: driver });
          } else if (change.type === 'modified') {
            changes.push({ type: 'modified', id: driverId, data: driver });
          } else if (change.type === 'removed') {
            changes.push({ type: 'removed', id: driverId });
          }
        });

        snapshot.forEach((doc) => {
          totalDrivers++;
          const driver = doc.data();
          const driverId = doc.id;
          
          // Vérifier la fraîcheur des données (max 5 minutes)
          const driverTimestamp = driver.ts?.toDate?.() || new Date(driver.ts);
          const isStale = (currentTime - driverTimestamp.getTime()) > 300000; // 5 minutes
          
          if (isStale) {
            console.log(`⚠️ Données obsolètes pour ${driverId}: ${Math.round((currentTime - driverTimestamp.getTime()) / 1000)}s`);
          }
          
          // Calculer distance seulement si nécessaire
          let distance = 0;
          let includeDriver = true;
          
          if (radiusKm < 1000) { // Rayon normal
            distance = this.calculateHaversineDistance(
              passengerLocation.latitude,
              passengerLocation.longitude,
              driver.lat,
              driver.lng
            );
            includeDriver = distance <= radiusKm;
          } else {
            // Mode démo - inclure tous les chauffeurs
            distance = this.calculateHaversineDistance(
              passengerLocation.latitude,
              passengerLocation.longitude,
              driver.lat,
              driver.lng
            );
            includeDriver = true;
          }

          if (includeDriver) {
            drivers.push({
              id: driverId,
              lat: driver.lat,
              lng: driver.lng,
              latitude: driver.lat,
              longitude: driver.lng,
              available: driver.av === 1,
              distance: Math.round(distance * 100) / 100, // Arrondir à 2 décimales
              timestamp: driver.ts,
              isStale: isStale,
              lastSeen: driverTimestamp,
              isDemoMode: radiusKm >= 1000,
              // Données supplémentaires du conducteur
              name: driver.displayName || driver.name || 'Conducteur',
              rating: driver.rating || 5,
              vehicle: driver.vehicle || 'Véhicule',
              phoneNumber: driver.phoneNumber || ''
            });
          }
        });

        // Trier par distance puis par fraîcheur
        drivers.sort((a, b) => {
          if (a.isStale !== b.isStale) {
            return a.isStale ? 1 : -1; // Conducteurs actifs en premier
          }
          return a.distance - b.distance;
        });

        // Métadonnées pour le callback
        const metadata = {
          totalDrivers,
          nearbyDrivers: drivers.length,
          changes: changes.length,
          lastUpdate: currentTime,
          isDemoMode: radiusKm >= 1000,
          radius: radiusKm,
          staleDrivers: drivers.filter(d => d.isStale).length
        };

        console.log(`🔄 Mise à jour temps réel: ${drivers.length}/${totalDrivers} conducteurs (${changes.length} changements)`);
        
        // Mettre à jour le cache
        lastDriversSnapshot.clear();
        drivers.forEach(driver => lastDriversSnapshot.set(driver.id, driver));
        lastUpdateTime = currentTime;
        
        callback(drivers, metadata);
        
      }, (error) => {
        console.error('❌ Erreur listener Firebase:', error);
        
        // Stratégie de récupération d'erreur
        if (error.code === 'permission-denied') {
          console.error('🔒 Permissions Firebase insuffisantes');
        } else if (error.code === 'unavailable') {
          console.error('🌐 Service Firebase temporairement indisponible');
        }
        
        callback([], { error: error.message, code: error.code });
      });

      console.log('✅ Listener temps réel configuré avec succès');
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Échec création listener:', error);
      callback([], { error: error.message });
      return () => {}; // Fonction vide pour cleanup
    }
  }
}

// Export singleton instance
export default new LocationService();