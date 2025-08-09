import { firestore } from '../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import LocationService from './locationService';

/**
 * Automatic driver registration service
 * Handles automatic registration of drivers in drivers_live collection
 * when they open the app and authenticate
 */

class DriverAutoRegistration {
  constructor() {
    this.isRegistered = false;
    this.driverId = null;
    this.locationService = LocationService;
  }

  /**
   * Automatically register driver in drivers_live when they open the app
   * @param {string} driverId - Firebase Auth UID of the driver
   * @returns {Promise<boolean>} - Success status
   */
  async autoRegisterDriver(driverId) {
    if (!driverId) {
      console.error('❌ No driver ID provided for auto-registration');
      return false;
    }

    try {
      console.log('🚗 Auto-registering driver in drivers_live:', driverId);
      
      // Get driver's current location
      const location = await this.locationService.getCurrentLocation({ timeout: 5000 });
      
      // Create minimal driver data for drivers_live collection
      const driverData = {
        lat: Math.round(location.latitude * 100000) / 100000,
        lng: Math.round(location.longitude * 100000) / 100000,
        av: 0, // Initially unavailable until they go online
        ts: serverTimestamp()
      };

      // Register driver in drivers_live
      await setDoc(doc(firestore, 'drivers_live', driverId), driverData);
      
      console.log('✅ Driver auto-registered successfully in drivers_live');
      this.isRegistered = true;
      this.driverId = driverId;
      
      return true;
    } catch (error) {
      console.error('❌ Failed to auto-register driver:', error);
      return false;
    }
  }

  /**
   * Check if driver exists in drivers_live collection
   * @param {string} driverId - Firebase Auth UID
   * @returns {Promise<boolean>} - Existence status
   */
  async isDriverRegistered(driverId) {
    try {
      const { firestore } = require('../config/firebase');
      const { doc, getDoc } = require('firebase/firestore');
      
      const driverDoc = await getDoc(doc(firestore, 'drivers_live', driverId));
      return driverDoc.exists();
    } catch (error) {
      console.error('❌ Error checking driver registration:', error);
      return false;
    }
  }

  /**
   * Update driver's online status
   * @param {string} driverId - Firebase Auth UID
   * @param {boolean} isOnline - Whether driver is online
   * @returns {Promise<boolean>} - Success status
   */
  async updateDriverStatus(driverId, isOnline) {
    if (!driverId) return false;

    try {
      const { firestore } = require('../config/firebase');
      const { doc, updateDoc } = require('firebase/firestore');
      
      await updateDoc(doc(firestore, 'drivers_live', driverId), {
        av: isOnline ? 1 : 0,
        ts: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error updating driver status:', error);
      return false;
    }
  }

  /**
   * Remove driver from drivers_live collection (when logging out)
   * @param {string} driverId - Firebase Auth UID
   * @returns {Promise<boolean>} - Success status
   */
  async removeDriver(driverId) {
    if (!driverId) return false;

    try {
      const { firestore } = require('../config/firebase');
      const { doc, deleteDoc } = require('firebase/firestore');
      
      await deleteDoc(doc(firestore, 'drivers_live', driverId));
      this.isRegistered = false;
      this.driverId = null;
      
      return true;
    } catch (error) {
      console.error('❌ Error removing driver:', error);
      return false;
    }
  }
}

// Export singleton instance
export const driverAutoRegistration = new DriverAutoRegistration();