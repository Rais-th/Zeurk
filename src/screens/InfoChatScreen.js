import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { sendMessage } from '../config/openrouter';
import ChatMessageBubble from '../components/ChatMessageBubble';

export default function InfoChatScreen({ navigation }) {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Bonjour! Je suis Zeurk AI, votre guide à Kinshasa et expert de l\'application. Comment puis-je vous aider aujourd\'hui?', type: 'support' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  const handleSend = async () => {
    if (inputText.trim().length === 0 || isLoading) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      type: 'user',
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputText('');
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const aiResponse = await sendMessage([...messages, newMessage]);
      setMessages(prevMessages => [...prevMessages, {
        id: (Date.now() + 1).toString(),
        ...aiResponse
      }]);
    } catch (error) {
      setMessages(prevMessages => [...prevMessages, {
        id: (Date.now() + 1).toString(),
        text: error.message,
        type: 'support'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
            navigation.goBack();
          }} style={styles.backButton}>
            <Ionicons name="chevron-back" size={32} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.headerText}>Zeurk AI</Text>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => <ChatMessageBubble item={item} />}
          keyExtractor={item => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Écrivez votre message..."
            placeholderTextColor="#5E5E5E"
            multiline
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              { backgroundColor: inputText.length > 0 && !isLoading ? '#007AFF' : 'transparent' }
            ]} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
              handleSend();
            }}
            disabled={inputText.length === 0 || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#007AFF" size="small" />
            ) : (
              <Ionicons 
                name="arrow-up" 
                size={20} 
                color={inputText.length > 0 ? '#fff' : '#5E5E5E'} 
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
    backgroundColor: '#000',
  },
  backButton: {
    marginLeft: 10,
    zIndex: 1,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
    marginLeft: -42,
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    paddingHorizontal: 15,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 