import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Noir absolu Apple
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  swipeIndicator: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: width / 2 - 20,
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    zIndex: 1000,
  },
  
  // PANNEAU GLISSANT - Esthétique Apple moderne
  draggablePanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000', // Noir absolu, pas gris
    borderTopLeftRadius: 38, // Plus de courbure Apple
    borderTopRightRadius: 38,
    overflow: 'hidden',
    // Ombre Apple - plus subtile et sophistiquée
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
      },
      android: {
        elevation: 25,
        shadowColor: '#000000',
      },
    }),
  },
  panelHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#48484A', // Gris Apple spécifique, plus raffiné
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20, // Plus d'espace respiratoire
  },
  panelContent: {
    flex: 1,
    paddingHorizontal: 24, // Espacement plus généreux Apple
    paddingBottom: Platform.OS === 'ios' ? 34 : 24, // Safe area iOS
  },
  
  // SECTION PARAMÈTRES - Style Apple moderne
  settingsWrapper: {
    width: '100%',
    overflow: 'hidden',
  },
  settingsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  settingsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.33,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 17,
    color: '#fff',
    fontWeight: '400',
    letterSpacing: -0.24,
  },
  settingArrow: {
    marginLeft: 8,
  },
  
  // ÉTATS - Esthétique Apple moderne
  offlineContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '5%',
  },
  yesterdaySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    alignSelf: 'center',
  },
  yesterdayNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.5,
  },
  yesterdayUnit: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
    letterSpacing: -0.2,
  },
  
  // BOUTON PRINCIPAL - Design Apple moderne
  startButton: {
    backgroundColor: '#007AFF', // Bleu système Apple
    borderRadius: 25, // Courbure Apple moderne
    paddingVertical: 16,
    paddingHorizontal: 64,
    minHeight: 50, // Hauteur tactile Apple
    // Ombre Apple plus sophistiquée
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
        shadowColor: '#007AFF',
      },
    }),
    marginBottom: 60, // Augmenté de 30 à 60 pour plus d'espace
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 17, // Taille système Apple
    fontWeight: '600', // Semi-bold Apple
    textAlign: 'center',
    letterSpacing: -0.24,
  },
  
  // ÉTAT ONLINE - Performance Apple
  onlineContainer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  todaySummary: {
    alignItems: 'center',
    marginBottom: 64,
  },
  todayNumber: {
    color: '#007AFF', // Bleu système pour les données actives
    fontSize: 96,
    fontWeight: '100',
    marginBottom: -12,
    letterSpacing: -2.4,
  },
  todayUnit: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '500', // Légèrement plus bold pour l'importance
    marginBottom: 4,
    letterSpacing: -0.24,
  },
  todayTime: {
    color: '#8E8E93',
    fontSize: 15, // Légèrement plus petit pour la hiérarchie
    fontWeight: '400',
    letterSpacing: -0.24,
  },
  
  // BOUTON ACTIF - Style Apple moderne
  activeButton: {
    backgroundColor: 'rgba(28, 28, 30, 0.8)', // Noir translucide Apple
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    borderWidth: 0.33, // Bordure ultra-fine
    borderColor: '#48484A', // Gris Apple
    // Effet glassmorphism Apple
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  activeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.24,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#30D158', // Vert système Apple
    marginRight: 12,
    // Légère lueur Apple
    ...Platform.select({
      ios: {
        shadowColor: '#30D158',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
      },
    }),
  },
  
  // BOUTON DE RETOUR - Minimalisme Apple
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40, // Alignement avec la safe area
    left: 20,
    width: 44, // Taille tactile Apple standard
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(28, 28, 30, 0.7)', // Glassmorphism Apple
    justifyContent: 'center',
    alignItems: 'center',
    // Bordure ultra-subtile
    borderWidth: 0.33,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Styles pour la flèche animée
  gestureHintContainer: {
    alignItems: 'center',
    width: '100%',
  },
  gestureHintText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.1,
    textAlign: 'center',
    marginBottom: 10,
  },
  downArrowContainer: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
  },
  secondArrow: {
    marginTop: -38,
    opacity: 0.4,
  },

  dynamicIsland: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    alignSelf: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    // Effet glassmorphism subtil
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(10px)',
  },
  dynamicIslandContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dynamicIslandNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.5,
  },
  dynamicIslandText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: -0.2,
  },

  settingItemWithToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 0.33,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  settingSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
    letterSpacing: -0.1,
  },

  financesModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 1000,
  },
  financesContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 120 : 60, // Augmenté pour baisser le contenu
  },
  
  // Nouveaux styles ultra-simplifiés
  amountContainer: {
    marginTop: 20,
    marginBottom: 40, // Augmenté pour pousser les actions plus bas
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  amountIconContainer: {
    width: 0,
    height: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginRight: 8,
  },
  amountTrendIcon: {
    // Style pour l'icône de tendance (flèche vers le haut)
  },
  periodSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 6,
    marginTop: 0,
    marginBottom: 15,
  },
  periodOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: 'transparent',
  },
  periodOptionSelected: {
    backgroundColor: '#FFFFFF',
  },
  periodOptionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  periodOptionTextSelected: {
    color: '#000000',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20, // Réduit pour rapprocher des éléments du dessus
    marginBottom: 40,
  },
  actionButton: {
    width: '45%',
    height: 90,
    borderRadius: 12,
    overflow: 'hidden', // Important pour que le dégradé ne dépasse pas les bords
  },
  actionButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  recentTransactionsContainer: {
    marginTop: 30, // Ajouté pour pousser l'historique vers le bas
    marginBottom: 20,
  },
  sectionTitleContainerCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  sectionTitleCentered: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 0,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10, // Réduit le padding vertical pour être plus compact
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 0, // Supprime la marge entre les items pour un look plus liste
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIconContainer: {
    width: 0, // Taille zéro pour masquer le conteneur
    height: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0, // Supprimer la marge pour ne pas laisser d'espace vide
  },
  transactionAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plusSign: {
    fontSize: 18,
    color: '#00C805',
    fontWeight: 'bold',
    marginRight: 2,
  },
  transactionAmount: {
    fontSize: 18,
    color: '#00C805',
    fontWeight: 'bold',
  },
  transactionTime: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 0, // Ajuster la marge pour le texte
  },
  closeButtonAtBottom: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(60, 60, 60, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 40,
  },

  // Styles pour la modal de retrait
  withdrawModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  withdrawModalOverlay: {
    flex: 1,
  },
  withdrawModalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    minHeight: '60%',
  },
  withdrawModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  withdrawCloseButton: {
    padding: 5,
  },
  withdrawModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  withdrawHeaderRight: {
    width: 30,
  },
  withdrawModalScroll: {
    flex: 1,
    padding: 20,
  },
  availableAmountContainer: {
    alignItems: 'center',
    marginBottom: 25,
    padding: 20,
    backgroundColor: 'rgba(0, 200, 5, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 5, 0.3)',
  },
  availableAmountLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  availableAmountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00C805',
  },
  feesWarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  feesWarningText: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    marginTop: 10,
  },
  paymentMethodsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
  },
  paymentMethodButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  paymentMethodLogo: {
    width: '70%',
    height: '70%',
  },
  phoneInputContainer: {
    marginBottom: 25,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
  },
  phoneIcon: {
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  amountInputContainer: {
    marginBottom: 25,
  },
  depositTotalDueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF', // Bleu système Apple
    marginBottom: 10,
    textAlign: 'center',
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 60,
    borderWidth: 2,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  currencyText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  calculationContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  calculationValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  calculationTotal: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  calculationTotalLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  calculationTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmWithdrawButton: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  confirmWithdrawText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Styles pour la modal de versement
  depositModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  depositModalOverlay: {
    flex: 1,
  },
  depositModalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: '60%',
  },
  depositModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  depositCloseButton: {
    padding: 5,
  },
  depositModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  depositHeaderRight: {
    width: 30,
  },
  depositModalScroll: {
    flex: 1,
    padding: 20,
  },
  amountInputContainer: {
    marginBottom: 25,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 60,
    borderWidth: 2,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  currencyText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  calculationContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  calculationValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  calculationTotal: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  calculationTotalLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  calculationTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmDepositButton: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  confirmDepositText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Styles pour la modal de performances
  performanceModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  performanceModalOverlay: {
    flex: 1,
  },
  performanceModalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: '60%',
  },
  performanceModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  performanceCloseButton: {
    padding: 5,
  },
  performanceModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  performanceHeaderRight: {
    width: 30,
  },
  performanceModalScroll: {
    flex: 1,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  performanceItemContainer: {
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(28, 28, 30, 0.8)', // Fond sombre translucide
    borderRadius: 15,
    borderWidth: 0.33,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Bordure très fine
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  performanceItemLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    marginBottom: 8,
  },
  performanceItemValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  performanceValueAccentText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF', // Bleu système Apple pour l'accentuation
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  starIcon: {
    marginHorizontal: 2,
  },
  ratingValueText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 10,
  },

  // FINANCES MODAL
  financesModalContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  financesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activePeriodButton: {
    backgroundColor: '#007AFF',
  },
  periodButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  totalRevenueContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  totalRevenueLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  totalRevenueValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  detailsContainer: {
    marginTop: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 15,
  },
  detailLabel: {
    fontSize: 17,
    color: '#FFFFFF',
  },
  detailValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // DEPOSIT MODAL
  depositModalContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  totalDueContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
  },
  totalDueText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // VEHICLES & DOCUMENTS MODAL
  vehiclesListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  vehicleItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(28, 28, 30, 0.8)', // Fond sombre translucide
    borderRadius: 15,
    marginBottom: 20,
    paddingHorizontal: 20,
    borderWidth: 0.33,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Bordure très fine
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  vehicleImage: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  vehicleInfoContainer: {
    flex: 1,
  },
  vehicleBrand: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  vehiclePlate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  vehicleStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: 'rgba(48, 209, 88, 0.2)', // Green tint
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)', // Orange tint
  },
  vehicleStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Nouvelle definition pour le titre de la modal Vehicules & Documents
  vehiclesModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },

  // PROFILE MODAL
  profileModalContainer: {
    margin: 0, // Supprime les marges par défaut de la modale
    justifyContent: 'flex-end', // Aligne le contenu en bas
  },
  profileModalOverlay: {
    flex: 1,
  },
  profileModalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 29,
    paddingHorizontal: 15,
    height: 'auto',
    maxHeight: height * 0.7,
    flex: 1,
  },
  profileModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1,
    marginBottom: 10,
  },
  profileCloseButton: {
    padding: 5,
  },
  profileModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  profileHeaderRight: {
    width: 30,
  },
  profileModalScroll: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 15 : 10,
  },
  profileAvatarContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: Dimensions.get('window').width / 2 - 50 - 15,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#1C1C1E',
  },
  profileInfoSection: {
    marginBottom: 10,
  },
  profileLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    fontWeight: '500',
  },
  profileInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 17,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  saveProfileButton: {
    backgroundColor: '#007AFF',
    borderRadius: 15,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
        shadowColor: '#007AFF',
      },
    }),
  },
  saveProfileButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  driverMarker: {
    width: 40,
    height: 40,
  },

  // Style pour les marqueurs de demande de course
  rideRequestMarker: {
    padding: 8,
    backgroundColor: 'rgba(255, 199, 0, 1)', // Jaune vif pour la visibilité
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  rideRequestMarkerText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },

  statusToggle: {
    // ... existing code ...
  },

  // Styles pour RideRequestModal
  rideRequestModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  rideRequestModalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  rideRequestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  clientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  clientRating: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  priceLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  rideDetailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    marginRight: 12,
  },
  destinationDot: {
    backgroundColor: '#FF6B6B',
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 2,
  },
  locationAddress: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  durationText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#8E8E93',
    marginLeft: 5,
    marginVertical: 8,
  },
  additionalInfo: {
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: '#8E8E93',
    fontSize: 14,
    marginLeft: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  declineButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});