import NetInfo from '@react-native-async-storage/async-storage';
import { networkManager } from './networkManager';

/**
 * Request Queue Manager with Exponential Backoff
 * Optimized for 2G/3G networks and poor connectivity scenarios
 */
class RequestQueueManager {
  constructor() {
    this.queues = {
      critical: [],    // Ride booking, payments, emergency
      high: [],        // Driver matching, location updates
      medium: [],      // Profile updates, preferences
      low: []          // Analytics, logs, non-essential data
    };
    
    this.isProcessing = false;
    this.retryAttempts = new Map();
    this.networkType = 'unknown';
    this.connectionQuality = 'good';
    
    // Configuration for different network types
    this.networkConfig = {
      '2g': {
        maxConcurrent: 1,
        timeout: 15000,
        retryDelay: 2000,
        maxRetries: 5
      },
      '3g': {
        maxConcurrent: 2,
        timeout: 10000,
        retryDelay: 1500,
        maxRetries: 4
      },
      '4g': {
        maxConcurrent: 3,
        timeout: 8000,
        retryDelay: 1000,
        maxRetries: 3
      },
      'wifi': {
        maxConcurrent: 5,
        timeout: 5000,
        retryDelay: 500,
        maxRetries: 3
      }
    };
    
    this.init();
  }

  async init() {
    // Monitor network changes
    NetInfo.addEventListener(this.handleNetworkChange.bind(this));
    
    // Start processing queue
    this.startQueueProcessor();
    
    console.log('🔄 Request Queue Manager initialized');
  }

  handleNetworkChange(state) {
    this.networkType = this.getNetworkType(state);
    this.connectionQuality = this.assessConnectionQuality(state);
    
    console.log(`📶 Network changed: ${this.networkType} (${this.connectionQuality})`);
    
    // Resume processing if network improved
    if (state.isConnected && !this.isProcessing) {
      this.startQueueProcessor();
    }
  }

  getNetworkType(state) {
    if (!state.isConnected) return 'offline';
    if (state.type === 'wifi') return 'wifi';
    if (state.type === 'cellular') {
      // Estimate based on connection details
      if (state.details?.cellularGeneration === '4g') return '4g';
      if (state.details?.cellularGeneration === '3g') return '3g';
      if (state.details?.cellularGeneration === '2g') return '2g';
      return '3g'; // Default assumption for cellular
    }
    return 'unknown';
  }

  assessConnectionQuality(state) {
    if (!state.isConnected) return 'offline';
    
    // Simple quality assessment based on network type
    if (state.type === 'wifi') return 'excellent';
    if (this.networkType === '4g') return 'good';
    if (this.networkType === '3g') return 'fair';
    if (this.networkType === '2g') return 'poor';
    return 'unknown';
  }

  /**
   * Add request to appropriate queue based on priority
   */
  enqueue(request, priority = 'medium') {
    const queuedRequest = {
      id: this.generateRequestId(),
      ...request,
      priority,
      timestamp: Date.now(),
      attempts: 0
    };

    this.queues[priority].push(queuedRequest);
    
    console.log(`📤 Queued ${priority} priority request: ${request.type || 'unknown'}`);
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.startQueueProcessor();
    }
    
    return queuedRequest.id;
  }

  /**
   * Process queues with network-aware concurrency
   */
  async startQueueProcessor() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    console.log('🚀 Starting queue processor...');

    while (this.hasQueuedRequests()) {
      const networkState = await NetInfo.fetch();
      
      if (!networkState.isConnected) {
        console.log('📵 No connection, pausing queue processor');
        await this.wait(2000);
        continue;
      }

      const config = this.networkConfig[this.networkType] || this.networkConfig['3g'];
      const requests = this.getNextRequests(config.maxConcurrent);
      
      if (requests.length === 0) {
        await this.wait(1000);
        continue;
      }

      // Process requests concurrently based on network capacity
      const promises = requests.map(request => this.processRequest(request, config));
      await Promise.allSettled(promises);
      
      // Brief pause between batches for 2G/3G networks
      if (this.networkType === '2g' || this.networkType === '3g') {
        await this.wait(500);
      }
    }

    this.isProcessing = false;
    console.log('✅ Queue processor finished');
  }

  /**
   * Get next requests to process based on priority
   */
  getNextRequests(maxCount) {
    const requests = [];
    
    // Process in priority order: critical > high > medium > low
    for (const priority of ['critical', 'high', 'medium', 'low']) {
      while (requests.length < maxCount && this.queues[priority].length > 0) {
        requests.push(this.queues[priority].shift());
      }
    }
    
    return requests;
  }

  /**
   * Process individual request with exponential backoff
   */
  async processRequest(request, config) {
    const requestId = request.id;
    
    try {
      console.log(`🔄 Processing request ${requestId} (attempt ${request.attempts + 1})`);
      
      // Execute the request with timeout
      const result = await Promise.race([
        this.executeRequest(request),
        this.timeoutPromise(config.timeout)
      ]);
      
      console.log(`✅ Request ${requestId} completed successfully`);
      this.retryAttempts.delete(requestId);
      
      // Call success callback if provided
      if (request.onSuccess) {
        request.onSuccess(result);
      }
      
      return result;
      
    } catch (error) {
      console.log(`❌ Request ${requestId} failed:`, error.message);
      
      request.attempts++;
      
      if (request.attempts < config.maxRetries) {
        // Calculate exponential backoff delay
        const baseDelay = config.retryDelay;
        const exponentialDelay = baseDelay * Math.pow(2, request.attempts - 1);
        const jitterDelay = exponentialDelay + (Math.random() * 1000);
        
        console.log(`⏳ Retrying request ${requestId} in ${Math.round(jitterDelay)}ms`);
        
        // Re-queue with delay
        setTimeout(() => {
          this.queues[request.priority].unshift(request);
        }, jitterDelay);
        
      } else {
        console.log(`💀 Request ${requestId} failed permanently after ${request.attempts} attempts`);
        
        // Call error callback if provided
        if (request.onError) {
          request.onError(error);
        }
        
        this.retryAttempts.delete(requestId);
      }
    }
  }

  /**
   * Execute the actual request
   */
  async executeRequest(request) {
    if (typeof request.execute === 'function') {
      return await request.execute();
    }
    
    // Default fetch implementation
    const response = await fetch(request.url, {
      method: request.method || 'GET',
      headers: request.headers || {},
      body: request.body ? JSON.stringify(request.body) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Create timeout promise
   */
  timeoutPromise(timeout) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    });
  }

  /**
   * Utility methods
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  hasQueuedRequests() {
    return Object.values(this.queues).some(queue => queue.length > 0);
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get queue status for debugging
   */
  getQueueStatus() {
    return {
      critical: this.queues.critical.length,
      high: this.queues.high.length,
      medium: this.queues.medium.length,
      low: this.queues.low.length,
      isProcessing: this.isProcessing,
      networkType: this.networkType,
      connectionQuality: this.connectionQuality
    };
  }

  /**
   * Clear all queues (use with caution)
   */
  clearQueues() {
    Object.keys(this.queues).forEach(priority => {
      this.queues[priority] = [];
    });
    this.retryAttempts.clear();
    console.log('🗑️ All queues cleared');
  }
}

// Export singleton instance
export const requestQueue = new RequestQueueManager();

// Helper functions for common use cases
export const queueRideRequest = (rideData, onSuccess, onError) => {
  return requestQueue.enqueue({
    type: 'RIDE_REQUEST',
    execute: async () => {
      // Simulate ride booking API call
      const response = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rideData)
      });
      return response.json();
    },
    onSuccess,
    onError
  }, 'critical');
};

export const queueLocationUpdate = (locationData, onSuccess, onError) => {
  return requestQueue.enqueue({
    type: 'LOCATION_UPDATE',
    execute: async () => {
      // Simulate location update API call
      const response = await fetch('/api/location', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationData)
      });
      return response.json();
    },
    onSuccess,
    onError
  }, 'high');
};

export const queueProfileUpdate = (profileData, onSuccess, onError) => {
  return requestQueue.enqueue({
    type: 'PROFILE_UPDATE',
    execute: async () => {
      // Simulate profile update API call
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      return response.json();
    },
    onSuccess,
    onError
  }, 'medium');
};

export const queueAnalytics = (analyticsData) => {
  return requestQueue.enqueue({
    type: 'ANALYTICS',
    execute: async () => {
      // Simulate analytics API call
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyticsData)
      });
      return response.json();
    }
  }, 'low');
};