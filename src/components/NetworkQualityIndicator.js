import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRequestQueue } from '../hooks/useRequestQueue';

/**
 * Network Quality Indicator Component
 * Shows current network status and queue information
 */
export default function NetworkQualityIndicator({ style, showDetails = false }) {
  const {
    queueStatus,
    totalQueuedRequests,
    getNetworkQualityColor,
    getNetworkTypeText,
    isNetworkOptimal
  } = useRequestQueue();

  const getSignalIcon = () => {
    switch (queueStatus.connectionQuality) {
      case 'excellent': return 'cellular';
      case 'good': return 'cellular';
      case 'fair': return 'cellular-outline';
      case 'poor': return 'cellular-outline';
      case 'offline': return 'cellular-off';
      default: return 'help-circle-outline';
    }
  };

  const getSignalBars = () => {
    switch (queueStatus.connectionQuality) {
      case 'excellent': return 4;
      case 'good': return 3;
      case 'fair': return 2;
      case 'poor': return 1;
      case 'offline': return 0;
      default: return 0;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.networkInfo}>
        {/* Signal Strength Bars */}
        <View style={styles.signalBars}>
          {[1, 2, 3, 4].map(bar => (
            <View
              key={bar}
              style={[
                styles.signalBar,
                {
                  height: bar * 3 + 2,
                  backgroundColor: bar <= getSignalBars() 
                    ? getNetworkQualityColor() 
                    : '#E0E0E0'
                }
              ]}
            />
          ))}
        </View>

        {/* Network Type */}
        <Text style={[styles.networkType, { color: getNetworkQualityColor() }]}>
          {getNetworkTypeText()}
        </Text>

        {/* Queue Status */}
        {totalQueuedRequests > 0 && (
          <View style={styles.queueBadge}>
            <Text style={styles.queueText}>{totalQueuedRequests}</Text>
          </View>
        )}

        {/* Processing Indicator */}
        {queueStatus.isProcessing && (
          <View style={styles.processingIndicator}>
            <Ionicons name="sync" size={12} color="#2196F3" />
          </View>
        )}
      </View>

      {/* Detailed Information */}
      {showDetails && (
        <View style={styles.details}>
          <Text style={styles.detailText}>
            Qualité: {queueStatus.connectionQuality}
          </Text>
          {totalQueuedRequests > 0 && (
            <Text style={styles.detailText}>
              En attente: {totalQueuedRequests} requêtes
            </Text>
          )}
          {queueStatus.isProcessing && (
            <Text style={styles.processingText}>
              Synchronisation...
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  networkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
    height: 14,
  },
  signalBar: {
    width: 2,
    borderRadius: 1,
  },
  networkType: {
    fontSize: 12,
    fontWeight: '600',
  },
  queueBadge: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  queueText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  processingIndicator: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 2,
  },
  details: {
    marginLeft: 8,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },
  detailText: {
    fontSize: 11,
    color: '#666',
  },
  processingText: {
    fontSize: 11,
    color: '#2196F3',
    fontStyle: 'italic',
  },
});