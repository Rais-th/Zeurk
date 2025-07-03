import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';

const ChatMessageBubble = ({ item }) => {
  const isUserMessage = item.type === 'user';
  const bubbleStyle = [
    styles.bubble,
    isUserMessage ? styles.userBubble : styles.supportBubble,
  ];

  const opacity = useRef(new Animated.Value(isUserMessage ? 1 : 0)).current; // Initialise l'opacité à 1 pour les messages utilisateur

  useEffect(() => {
    if (!isUserMessage) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200, // Réduction de la durée pour un effet plus rapide
        useNativeDriver: true,
      }).start();
    }
  }, [item]);

  return (
    <Animated.View style={[styles.messageContainer, isUserMessage ? styles.userMessage : styles.supportMessage, { opacity }]}>
      {!isUserMessage && (
        <View style={styles.supportAvatar}>
          <Text style={styles.supportAvatarText}>Z</Text>
        </View>
      )}
      <View style={bubbleStyle}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  supportMessage: {
    justifyContent: 'flex-start',
  },
  supportAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bubble: {
    maxWidth: '75%',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 5,
  },
  supportBubble: {
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
});

export default ChatMessageBubble; 