// Import des logos des opérateurs
const airtelLogo = require('../../../assets/icons/airtel.jpg');
const orangeLogo = require('../../../assets/icons/orange.png');
const mpesaLogo = require('../../../assets/icons/mpesa.png');

// Style de carte sombre cohérent avec l'application
export const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#1a1a1a"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1a1a1a"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#0a0a0a"
      }
    ]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#1f1f1f"
      }
    ]
  }
];

// Données fictives de revenus en franc congolais (FC)
export const revenusData = {
  jour: '85 000 FC',
  semaine: '560 000 FC',
  mois: '2 350 000 FC',
  annee: '24 500 000 FC'
};

// Données numériques pour le graphique
export const chartData = {
  jour: [25000, 35000, 28000, 45000, 85000, 75000, 85000],
  semaine: [320000, 410000, 380000, 490000, 520000, 480000, 560000],
  mois: [1800000, 1950000, 2100000, 1900000, 2200000, 2050000, 2350000],
  annee: [18500000, 19800000, 21500000, 20800000, 22500000, 23800000, 24500000]
};

// Libellés pour le graphique
export const chartLabels = {
  jour: ['8h', '10h', '12h', '14h', '16h', '18h', '20h'],
  semaine: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  mois: ['Sem1', 'Sem2', 'Sem3', 'Sem4', 'Sem5', 'Sem6', 'Sem7'],
  annee: ['Jan', 'Mar', 'Mai', 'Juil', 'Sep', 'Nov', 'Déc']
};

// Méthodes de paiement disponibles pour le retrait
export const paymentMethods = [
  {
    id: 'airtel_money',
    name: 'Airtel Money',
    logo: airtelLogo,
    color: '#e70000',
    placeholder: '0978 XXX XXX',
  },
  {
    id: 'orange_money',
    name: 'Orange Money',
    logo: orangeLogo,
    color: '#FF6600',
    placeholder: '0898 XXX XXX',
  },
  {
    id: 'mpesa',
    name: 'M-Pesa',
    logo: mpesaLogo,
    color: '#00A651',
    placeholder: '0971 XXX XXX',
  },
];

export const mockRideRequests = [
  {
    id: 'ride1',
    startAddress: 'Avenue de la Gombe, Kinshasa',
    endAddress: 'Rond-point Victoire, Matonge',
    price: 8500, // En Francs Congolais
    duration: 15, // en minutes
    coordinates: {
      latitude: -4.3188,
      longitude: 15.3050,
    },
  },
  {
    id: 'ride2',
    startAddress: 'Boulevard du 30 Juin, Kinshasa',
    endAddress: 'Aéroport de N\'djili',
    price: 25000,
    duration: 35,
    coordinates: {
      latitude: -4.3250,
      longitude: 15.3125,
    },
  },
  {
    id: 'ride3',
    startAddress: 'Place des Artistes, Matonge',
    endAddress: 'Université de Kinshasa (UNIKIN)',
    price: 12000,
    duration: 25,
    coordinates: {
      latitude: -4.3390,
      longitude: 15.3015,
    },
  },
  {
    id: 'ride4',
    startAddress: 'Marché Central, Kinshasa',
    endAddress: 'Hôpital Général de Kinshasa',
    price: 6500,
    duration: 12,
    coordinates: {
      latitude: -4.3100,
      longitude: 15.3180,
    },
  },
  {
    id: 'ride5',
    startAddress: 'Stade des Martyrs',
    endAddress: 'Université Protestante au Congo',
    price: 15000,
    duration: 28,
    coordinates: {
      latitude: -4.3480,
      longitude: 15.2850,
    },
  },
  {
    id: 'ride6',
    startAddress: 'Commune de Lemba',
    endAddress: 'Centre-ville de Kinshasa',
    price: 18000,
    duration: 32,
    coordinates: {
      latitude: -4.3850,
      longitude: 15.2950,
    },
  },
  {
    id: 'ride7',
    startAddress: 'Bandal Market',
    endAddress: 'Kinshasa Golf Club',
    price: 9500,
    duration: 18,
    coordinates: {
      latitude: -4.2950,
      longitude: 15.3220,
    },
  },
  {
    id: 'ride8',
    startAddress: 'Avenue Kasa-Vubu',
    endAddress: 'Palais de la Nation',
    price: 7200,
    duration: 14,
    coordinates: {
      latitude: -4.3320,
      longitude: 15.3100,
    },
  },
  {
    id: 'ride9',
    startAddress: 'Commune de Ngaliema',
    endAddress: 'Marché de la Liberté',
    price: 13500,
    duration: 22,
    coordinates: {
      latitude: -4.3650,
      longitude: 15.2750,
    },
  },
  {
    id: 'ride10',
    startAddress: 'Institut National des Arts',
    endAddress: 'Port de Kinshasa',
    price: 11000,
    duration: 20,
    coordinates: {
      latitude: -4.3050,
      longitude: 15.2980,
    },
  },
  {
    id: 'ride11',
    startAddress: 'Quartier Masina',
    endAddress: 'Centre Commercial CCDI',
    price: 22000,
    duration: 40,
    coordinates: {
      latitude: -4.4100,
      longitude: 15.3400,
    },
  },
  {
    id: 'ride12',
    startAddress: 'Avenue des Cliniques',
    endAddress: 'Ambassade de France',
    price: 8000,
    duration: 16,
    coordinates: {
      latitude: -4.3150,
      longitude: 15.3080,
    },
  },
]; 