import { useState, useEffect, useCallback } from 'react';
import { requestQueue } from '../utils/requestQueue';

/**
 * Hook for managing request queue with network-aware retry logic
 */
export const useRequestQueue = () => {
  const [queueStatus, setQueueStatus] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    isProcessing: false,
    networkType: 'unknown',
    connectionQuality: 'unknown'
  });

  const [pendingRequests, setPendingRequests] = useState(new Map());

  // Update queue status periodically
  useEffect(() => {
    const updateStatus = () => {
      setQueueStatus(requestQueue.getQueueStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Queue a ride request with high priority
   */
  const queueRideRequest = useCallback((rideData) => {
    return new Promise((resolve, reject) => {
      const requestId = requestQueue.enqueue({
        type: 'RIDE_REQUEST',
        execute: async () => {
          // Simulate API call - replace with actual implementation
          console.log('🚗 Executing ride request:', rideData);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return { success: true, rideId: `ride_${Date.now()}`, ...rideData };
        },
        onSuccess: (result) => {
          setPendingRequests(prev => {
            const updated = new Map(prev);
            updated.delete(requestId);
            return updated;
          });
          resolve(result);
        },
        onError: (error) => {
          setPendingRequests(prev => {
            const updated = new Map(prev);
            updated.delete(requestId);
            return updated;
          });
          reject(error);
        }
      }, 'critical');

      setPendingRequests(prev => new Map(prev).set(requestId, {
        type: 'RIDE_REQUEST',
        timestamp: Date.now()
      }));
    });
  }, []);

  /**
   * Queue a location update
   */
  const queueLocationUpdate = useCallback((locationData) => {
    return new Promise((resolve, reject) => {
      const requestId = requestQueue.enqueue({
        type: 'LOCATION_UPDATE',
        execute: async () => {
          console.log('📍 Executing location update:', locationData);
          await new Promise(resolve => setTimeout(resolve, 500));
          return { success: true, timestamp: Date.now() };
        },
        onSuccess: (result) => {
          setPendingRequests(prev => {
            const updated = new Map(prev);
            updated.delete(requestId);
            return updated;
          });
          resolve(result);
        },
        onError: (error) => {
          setPendingRequests(prev => {
            const updated = new Map(prev);
            updated.delete(requestId);
            return updated;
          });
          reject(error);
        }
      }, 'high');

      setPendingRequests(prev => new Map(prev).set(requestId, {
        type: 'LOCATION_UPDATE',
        timestamp: Date.now()
      }));
    });
  }, []);

  /**
   * Queue a payment request
   */
  const queuePaymentRequest = useCallback((paymentData) => {
    return new Promise((resolve, reject) => {
      const requestId = requestQueue.enqueue({
        type: 'PAYMENT_REQUEST',
        execute: async () => {
          console.log('💳 Executing payment request:', paymentData);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return { 
            success: true, 
            transactionId: `txn_${Date.now()}`,
            amount: paymentData.amount,
            status: 'completed'
          };
        },
        onSuccess: (result) => {
          setPendingRequests(prev => {
            const updated = new Map(prev);
            updated.delete(requestId);
            return updated;
          });
          resolve(result);
        },
        onError: (error) => {
          setPendingRequests(prev => {
            const updated = new Map(prev);
            updated.delete(requestId);
            return updated;
          });
          reject(error);
        }
      }, 'critical');

      setPendingRequests(prev => new Map(prev).set(requestId, {
        type: 'PAYMENT_REQUEST',
        timestamp: Date.now()
      }));
    });
  }, []);

  /**
   * Queue a profile update
   */
  const queueProfileUpdate = useCallback((profileData) => {
    return new Promise((resolve, reject) => {
      const requestId = requestQueue.enqueue({
        type: 'PROFILE_UPDATE',
        execute: async () => {
          console.log('👤 Executing profile update:', profileData);
          await new Promise(resolve => setTimeout(resolve, 800));
          return { success: true, profile: profileData };
        },
        onSuccess: (result) => {
          setPendingRequests(prev => {
            const updated = new Map(prev);
            updated.delete(requestId);
            return updated;
          });
          resolve(result);
        },
        onError: (error) => {
          setPendingRequests(prev => {
            const updated = new Map(prev);
            updated.delete(requestId);
            return updated;
          });
          reject(error);
        }
      }, 'medium');

      setPendingRequests(prev => new Map(prev).set(requestId, {
        type: 'PROFILE_UPDATE',
        timestamp: Date.now()
      }));
    });
  }, []);

  /**
   * Queue analytics data (low priority)
   */
  const queueAnalytics = useCallback((analyticsData) => {
    const requestId = requestQueue.enqueue({
      type: 'ANALYTICS',
      execute: async () => {
        console.log('📊 Executing analytics:', analyticsData);
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true };
      }
    }, 'low');

    return requestId;
  }, []);

  /**
   * Get network quality indicator
   */
  const getNetworkQualityColor = useCallback(() => {
    switch (queueStatus.connectionQuality) {
      case 'excellent': return '#4CAF50';
      case 'good': return '#8BC34A';
      case 'fair': return '#FFC107';
      case 'poor': return '#FF9800';
      case 'offline': return '#F44336';
      default: return '#9E9E9E';
    }
  }, [queueStatus.connectionQuality]);

  /**
   * Get network type display text
   */
  const getNetworkTypeText = useCallback(() => {
    switch (queueStatus.networkType) {
      case 'wifi': return 'WiFi';
      case '4g': return '4G';
      case '3g': return '3G';
      case '2g': return '2G';
      case 'offline': return 'Hors ligne';
      default: return 'Inconnu';
    }
  }, [queueStatus.networkType]);

  /**
   * Clear all queues (emergency use)
   */
  const clearAllQueues = useCallback(() => {
    requestQueue.clearQueues();
    setPendingRequests(new Map());
  }, []);

  return {
    // Queue status
    queueStatus,
    pendingRequests: Array.from(pendingRequests.values()),
    
    // Queue methods
    queueRideRequest,
    queueLocationUpdate,
    queuePaymentRequest,
    queueProfileUpdate,
    queueAnalytics,
    
    // Utility methods
    getNetworkQualityColor,
    getNetworkTypeText,
    clearAllQueues,
    
    // Computed values
    totalQueuedRequests: queueStatus.critical + queueStatus.high + queueStatus.medium + queueStatus.low,
    hasPendingRequests: pendingRequests.size > 0,
    isNetworkOptimal: queueStatus.connectionQuality === 'excellent' || queueStatus.connectionQuality === 'good'
  };
};