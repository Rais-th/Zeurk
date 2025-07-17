import * as Location from 'expo-location';
import { GOOGLE_MAPS_APIKEY } from '@env';

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
}

// Export singleton instance
export default new LocationService();