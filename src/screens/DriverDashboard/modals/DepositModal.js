import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';
import { paymentMethods } from '../constants';

const DepositModal = ({
  visible,
  onClose,
  depositModalY,
  depositAmount,
  setDepositAmount,
  depositPaymentMethod,
  setDepositPaymentMethod,
  isProcessingDeposit,
  onProcessDeposit,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.depositModalContainer}>
        <TouchableOpacity 
          style={styles.depositModalOverlay}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View 
          style={[
            styles.depositModalContent,
            { transform: [{ translateY: depositModalY }] }
          ]}
        >
          <View style={styles.depositModalHeader}>
            <TouchableOpacity 
              style={styles.depositCloseButton}
              onPress={onClose}
            >
              <Ionicons name="chevron-down" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.depositModalTitle}>VERSEMENT</Text>
            <View style={styles.depositHeaderRight} />
          </View>

          <ScrollView style={styles.depositModalScroll} showsVerticalScrollIndicator={false}>
            {/* Montant à verser */}
            <View style={styles.amountInputContainer}>
              <Text style={styles.depositTotalDueText}>Total du: 0 FC</Text>
              <Text style={styles.sectionTitle}>MONTANT À VERSER</Text>
              <View style={[
                styles.amountInputWrapper,
                { borderColor: depositPaymentMethod ? depositPaymentMethod.color : '#48484A' }
              ]}>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={depositAmount}
                  onChangeText={setDepositAmount}
                  keyboardType="numeric"
                />
                <Text style={styles.currencyText}>FC</Text>
              </View>
            </View>

            {/* Sélecteur de méthode de paiement */}
            <Text style={styles.sectionTitle}>CHOISIR OPÉRATEUR</Text>
            <View style={styles.paymentMethodsGrid}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethodButton,
                    depositPaymentMethod?.id === method.id && {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: method.color,
                      borderWidth: 2,
                    }
                  ]}
                  onPress={() => setDepositPaymentMethod(method)}
                >
                  <Image 
                    source={method.logo} 
                    style={styles.paymentMethodLogo} 
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Bouton de confirmation */}
            {depositPaymentMethod && depositAmount && (
              <TouchableOpacity 
                style={[
                  styles.confirmDepositButton,
                  { backgroundColor: depositPaymentMethod ? depositPaymentMethod.color : '#48484A' },
                  isProcessingDeposit && styles.buttonDisabled
                ]}
                onPress={onProcessDeposit}
                disabled={isProcessingDeposit}
              >
                <Text style={styles.confirmDepositText}>
                  {isProcessingDeposit ? 'TRAITEMENT...' : 'CONFIRMER LE VERSEMENT'}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default DepositModal; 