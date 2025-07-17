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
  Image,
  SafeAreaView,
  Keyboard,
  Modal,
  Pressable,
  Linking,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function ChatScreen({ route, navigation }) {
  const { driverData } = route.params;
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', text: `${driverData.name} est en ligne.`, type: 'system' },
    { id: '2', text: 'Bonjour! J\'arrive.', type: 'driver' },
  ]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  const handleNormalCall = () => {
    const phoneNumber = '+13464553673';
    Linking.openURL(`tel:${phoneNumber}`);
    setIsModalVisible(false);
  };

  const handleWhatsAppCall = () => {
    // Numéro sans '+' ni caractères spéciaux
    const phoneNumber = '13464553673';
    Linking.openURL(`https://wa.me/${phoneNumber}`);
    setIsModalVisible(false);
  };

  const handleSend = () => {
    if (inputText.trim().length === 0) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      type: 'user',
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputText('');
    Keyboard.dismiss();

    setTimeout(() => {
      const driverReply = {
        id: (Date.now() + 1).toString(),
        text: 'Bien reçu.',
        type: 'driver',
      };
      setMessages(prevMessages => [...prevMessages, driverReply]);
    }, 1500);
  };

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessage = ({ item, index }) => {
    if (item.type === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }

    const isUserMessage = item.type === 'user';
    const bubbleColor = isUserMessage ? '#007AFF' : '#2C2C2E';
    
    // Pour la forme de la bulle
    const previousMessage = messages[index - 1];
    const nextMessage = messages[index + 1];
    const isFirstInGroup = !previousMessage || previousMessage.type !== item.type;
    const isLastInGroup = !nextMessage || nextMessage.type !== item.type;

    const bubbleStyle = [
      styles.bubble,
      { backgroundColor: bubbleColor },
      isUserMessage ? styles.userBubble : styles.driverBubble,
      isFirstInGroup && (isUserMessage ? styles.userBubbleFirst : styles.driverBubbleFirst),
      isLastInGroup && (isUserMessage ? styles.userBubbleLast : styles.driverBubbleLast),
    ];

    return (
      <View style={[styles.messageContainer, isUserMessage ? styles.userMessage : styles.driverMessage]}>
        <View style={bubbleStyle}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Ajustement si nécessaire
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={32} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
              <Image source={driverData.avatar} style={styles.headerAvatar} />
              <Text style={styles.headerName}>{driverData.name} <Ionicons name="chevron-forward" size={14} color="#555" /></Text>
          </View>
          <TouchableOpacity style={styles.callButton} onPress={() => setIsModalVisible(true)}>
            <Ionicons name="call-outline" size={26} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages.slice().reverse()} // On inverse les données pour l'affichage
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messageList}
          contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 10 }}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ecrivez votre message..."
            placeholderTextColor="#5E5E5E"
          />
          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: inputText.length > 0 ? '#007AFF' : 'transparent' }]} 
            onPress={handleSend}
            disabled={inputText.length === 0}
          >
            <Ionicons name="arrow-up" size={20} color={inputText.length > 0 ? '#fff' : '#5E5E5E'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(!isModalVisible);
        }}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalOptionsContainer}>
              <TouchableOpacity style={[styles.modalOption, styles.whatsappButton]} onPress={handleWhatsAppCall}>
                <FontAwesome5 name="whatsapp" size={24} color="#fff" style={{marginRight: 10}}/>
                <Text style={styles.whatsappButtonText}>Appel retournon a la page principale WhatsApp</Text>
              </TouchableOpacity>
              <View style={styles.separator} />
              <TouchableOpacity style={styles.modalOption} onPress={handleNormalCall}>
                <Ionicons name="call" size={22} color="#007AFF" style={{marginRight: 10}}/>
                <Text style={[styles.modalOptionText, {fontWeight: '600'}]}>Appel normal</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

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
      marginLeft: -42, // Compenser le bouton retour pour un centrage parfait
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  headerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  callButton: {
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 5,
  },
  messageList: {
    flex: 1,
  },
  messageContainer: {
    marginVertical: 1,
    flexDirection: 'row',
  },
  userMessage: {
    justifyContent: 'flex-end',
    marginLeft: 40,
  },
  driverMessage: {
    justifyContent: 'flex-start',
    marginRight: 40,
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    maxWidth: '100%',
  },
  messageText: {
    color: '#fff',
    fontSize: 17,
    lineHeight: 22,
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  driverBubble: {
    alignSelf: 'flex-start',
  },
  // Simuler les "queues" en changeant le radius
  userBubbleFirst: { borderTopRightRadius: 20 },
  userBubbleLast: { borderBottomRightRadius: 5 },
  driverBubbleFirst: { borderTopLeftRadius: 20 },
  driverBubbleLast: { borderBottomLeftRadius: 5 },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  systemMessageText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#000',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    paddingHorizontal: 15,
    color: '#fff',
    fontSize: 17,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333'
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Styles pour le Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: '95%',
    marginBottom: 20,
  },
  modalOptionsContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalOption: {
    paddingVertical: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalOptionText: {
    color: '#007AFF',
    fontSize: 20,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#3E3E40',
  },
  cancelButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 14,
    paddingVertical: 18,
    marginTop: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 20,
    fontWeight: '600',
  },
}); 