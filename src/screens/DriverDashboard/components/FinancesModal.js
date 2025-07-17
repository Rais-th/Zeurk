import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles';
import { revenusData } from '../constants';

const FinancesModal = ({
  visible,
  onClose,
  financesModalY,
  selectedPeriod,
  setSelectedPeriod,
}) => {
  if (!visible) {
    return null;
  }

  const onWithdraw = () => {
    // Simule un appel au backend pour initier un retrait (payout/remittance)
    Alert.alert(
      "Demande de retrait",
      "Le retrait via Airtel Money sera initié par notre serveur. Vous recevrez les fonds sur votre compte.",
      [{ text: "OK", onPress: onClose }]
    );
    // fetch('https://votre-backend.com/api/payouts/airtel/initiate-withdrawal', { ... });
  };

  const onDeposit = () => {
    // Simule un appel au backend pour initier un versement (collection)
    Alert.alert(
      "Demande de versement",
      "Une demande de paiement va être envoyée sur votre téléphone. Veuillez la valider avec votre code PIN pour effectuer le versement.",
      [{ text: "OK", onPress: onClose }]
    );
    // fetch('https://votre-backend.com/api/payments/airtel/initiate-collection', { ... });
  };

  return (
    <Animated.View 
      style={[
        styles.financesModal,
        {
          transform: [{ translateY: financesModalY }]
        }
      ]}
    >
      <ScrollView 
        style={styles.financesContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sélecteur de période */}
        <View style={styles.periodSelectorContainer}>
          <TouchableOpacity 
            style={[
              styles.periodOption, 
              selectedPeriod === 'jour' && styles.periodOptionSelected
            ]}
            onPress={() => setSelectedPeriod('jour')}
          >
            <Text 
              style={[
                styles.periodOptionText, 
                selectedPeriod === 'jour' && styles.periodOptionTextSelected
              ]}
            >
              JOUR
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.periodOption, 
              selectedPeriod === 'semaine' && styles.periodOptionSelected
            ]}
            onPress={() => setSelectedPeriod('semaine')}
          >
            <Text 
              style={[
                styles.periodOptionText, 
                selectedPeriod === 'semaine' && styles.periodOptionTextSelected
              ]}
            >
              SEMAINE
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.periodOption, 
              selectedPeriod === 'mois' && styles.periodOptionSelected
            ]}
            onPress={() => setSelectedPeriod('mois')}
          >
            <Text 
              style={[
                styles.periodOptionText, 
                selectedPeriod === 'mois' && styles.periodOptionTextSelected
              ]}
            >
              MOIS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Montant principal */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountValue}>{revenusData[selectedPeriod]}</Text>
          <MaterialIcons name="arrow-upward" size={24} color="#00C805" style={styles.amountTrendIcon} />
        </View>

        {/* Historique */}
        <View style={styles.recentTransactionsContainer}>
          <View style={styles.sectionTitleContainerCentered}>
            <Text style={styles.sectionTitleCentered}>HISTORIQUE</Text>
          </View>
          
          <View style={styles.transactionItem}>
            <Text style={styles.transactionTime}>AUJOURD'HUI</Text>
            <View style={styles.transactionAmountContainer}>
              <Text style={styles.plusSign}>+</Text>
              <Text style={styles.transactionAmount}>15 000 FC</Text>
            </View>
          </View>
          
          <View style={styles.transactionItem}>
            <Text style={styles.transactionTime}>AUJOURD'HUI</Text>
            <View style={styles.transactionAmountContainer}>
              <Text style={styles.plusSign}>+</Text>
              <Text style={styles.transactionAmount}>12 500 FC</Text>
            </View>
          </View>
          
          <View style={styles.transactionItem}>
            <Text style={styles.transactionTime}>AUJOURD'HUI</Text>
            <View style={styles.transactionAmountContainer}>
              <Text style={styles.plusSign}>+</Text>
              <Text style={styles.transactionAmount}>18 500 FC</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={onWithdraw}
          >
            <LinearGradient
              colors={['#00C805', '#008C00']}
              style={styles.actionButtonGradient}
            >
              <MaterialIcons name="attach-money" size={32} color="#000" />
              <Text style={styles.actionText}>RETRAIT</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={onDeposit}
          >
            <LinearGradient
              colors={['#3C4CCA', '#2B379C']}
              style={styles.actionButtonGradient}
            >
              <MaterialIcons name="arrow-upward" size={32} color="#FFF" />
              <Text style={styles.actionText}>VERSEMENT</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bouton de fermeture */}
        <TouchableOpacity 
          style={styles.closeButtonAtBottom}
          activeOpacity={0.8}
          onPress={onClose}
        >
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
};

export default FinancesModal; 