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
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { styles } from '../styles';
import { paymentMethods, revenusData } from '../constants';

const WithdrawModal = ({
  visible,
  onClose,
  withdrawModalY,
  selectedPeriod,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  phoneNumber,
  setPhoneNumber,
  withdrawAmount,
  setWithdrawAmount,
  isProcessingWithdraw,
  onProcessWithdraw,
}) => {
  const getAvailableAmount = () => {
    return parseInt(revenusData[selectedPeriod].replace(/\s/g, '').replace('FC', ''));
  };

  const calculateWithdrawFees = (amount) => {
    return Math.round(amount * 0.02);
  };

  const calculateNetAmount = (amount) => {
    return amount - calculateWithdrawFees(amount);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.withdrawModalContainer}>
        <TouchableOpacity 
          style={styles.withdrawModalOverlay}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View 
          style={[
            styles.withdrawModalContent,
            { transform: [{ translateY: withdrawModalY }] }
          ]}
        >
          <View style={styles.withdrawModalHeader}>
            <TouchableOpacity 
              style={styles.withdrawCloseButton}
              onPress={onClose}
            >
              <Ionicons name="chevron-down" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.withdrawModalTitle}>RETRAIT</Text>
            <View style={styles.withdrawHeaderRight} />
          </View>

          <ScrollView style={styles.withdrawModalScroll} showsVerticalScrollIndicator={false}>
            {/* Montant disponible */}
            <View style={styles.availableAmountContainer}>
              <Text style={styles.availableAmountLabel}>SOLDE DISPONIBLE</Text>
              <Text style={styles.availableAmountValue}>{revenusData[selectedPeriod]}</Text>
            </View>

            {/* Avertissement frais */}
            <View style={styles.feesWarningContainer}>
              <MaterialIcons name="info" size={20} color="#FF9500" />
              <Text style={styles.feesWarningText}>
                FRAIS DE RETRAIT DE 2% RETENUS PAR LES OPÉRATEURS
              </Text>
            </View>

            {/* Méthodes de paiement */}
            <Text style={styles.sectionTitle}>CHOISIR OPÉRATEUR</Text>
            <View style={styles.paymentMethodsGrid}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethodButton,
                    selectedPaymentMethod?.id === method.id && {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: method.color,
                      borderWidth: 2,
                    }
                  ]}
                  onPress={() => setSelectedPaymentMethod(method)}
                >
                  <Image 
                    source={method.logo} 
                    style={styles.paymentMethodLogo} 
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Numéro de téléphone */}
            {selectedPaymentMethod && (
              <View style={styles.phoneInputContainer}>
                <Text style={styles.sectionTitle}>NUMÉRO DE TÉLÉPHONE</Text>
                <View style={[
                  styles.phoneInputWrapper,
                  { borderColor: selectedPaymentMethod.color }
                ]}>
                  <FontAwesome5 
                    name="phone" 
                    size={16} 
                    color={selectedPaymentMethod.color} 
                    style={styles.phoneIcon} 
                  />
                  <TextInput
                    style={styles.phoneInput}
                    placeholder={selectedPaymentMethod.placeholder}
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            )}

            {/* Montant à retirer */}
            {selectedPaymentMethod && phoneNumber && (
              <View style={styles.amountInputContainer}>
                <Text style={styles.sectionTitle}>MONTANT À RETIRER</Text>
                <View style={[
                  styles.amountInputWrapper,
                  { borderColor: selectedPaymentMethod.color }
                ]}>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={withdrawAmount}
                    onChangeText={setWithdrawAmount}
                    keyboardType="numeric"
                  />
                  <Text style={styles.currencyText}>FC</Text>
                </View>
                
                {/* Calcul en temps réel */}
                {withdrawAmount && parseInt(withdrawAmount.replace(/\s/g, '')) > 0 && (
                  <View style={styles.calculationContainer}>
                    <View style={styles.calculationRow}>
                      <Text style={styles.calculationLabel}>Montant:</Text>
                      <Text style={styles.calculationValue}>
                        {parseInt(withdrawAmount.replace(/\s/g, '')).toLocaleString()} FC
                      </Text>
                    </View>
                    <View style={styles.calculationRow}>
                      <Text style={styles.calculationLabel}>Frais (2%):</Text>
                      <Text style={styles.calculationValue}>
                        -{calculateWithdrawFees(parseInt(withdrawAmount.replace(/\s/g, ''))).toLocaleString()} FC
                      </Text>
                    </View>
                    <View style={[styles.calculationRow, styles.calculationTotal]}>
                      <Text style={styles.calculationTotalLabel}>VOUS RECEVREZ:</Text>
                      <Text style={[styles.calculationTotalValue, { color: selectedPaymentMethod.color }]}>
                        {calculateNetAmount(parseInt(withdrawAmount.replace(/\s/g, ''))).toLocaleString()} FC
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Bouton de confirmation */}
            {selectedPaymentMethod && phoneNumber && withdrawAmount && (
              <TouchableOpacity 
                style={[
                  styles.confirmWithdrawButton,
                  { backgroundColor: selectedPaymentMethod.color },
                  isProcessingWithdraw && styles.buttonDisabled
                ]}
                onPress={onProcessWithdraw}
                disabled={isProcessingWithdraw}
              >
                <Text style={styles.confirmWithdrawText}>
                  {isProcessingWithdraw ? 'TRAITEMENT...' : 'CONFIRMER LE RETRAIT'}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default WithdrawModal; 