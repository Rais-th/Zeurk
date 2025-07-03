// Configuration et données de démonstration pour le marketplace automobile
export const vehicleCategories = [
  { id: 'sedan', name: 'Berline', icon: 'car-outline' },
  { id: 'suv', name: 'SUV', icon: 'car-sport-outline' },
  { id: 'pickup', name: 'Pick-up', icon: 'car-outline' },
  { id: 'minibus', name: 'Minibus', icon: 'bus-outline' },
  { id: 'motorcycle', name: 'Moto', icon: 'bicycle-outline' },
  { id: 'luxury', name: 'Luxe', icon: 'diamond-outline' },
];

export const vehicleConditions = [
  { id: 'new', name: 'Neuf', color: '#4CAF50' },
  { id: 'excellent', name: 'Excellent état', color: '#8BC34A' },
  { id: 'good', name: 'Bon état', color: '#FFC107' },
  { id: 'fair', name: 'État correct', color: '#FF9800' },
  { id: 'poor', name: 'À rénover', color: '#F44336' },
];

export const vehicleFuelTypes = [
  { id: 'gasoline', name: 'Essence', icon: 'flash-outline' },
  { id: 'diesel', name: 'Diesel', icon: 'flash-outline' },
  { id: 'hybrid', name: 'Hybride', icon: 'leaf-outline' },
  { id: 'electric', name: 'Électrique', icon: 'battery-charging-outline' },
];

export const vehicleTransmissions = [
  { id: 'manual', name: 'Manuelle' },
  { id: 'automatic', name: 'Automatique' },
  { id: 'cvt', name: 'CVT' },
];

export const fuelTypes = [
  { id: 'essence', name: 'Essence' },
  { id: 'diesel', name: 'Diesel' },
  { id: 'hybride', name: 'Hybride' },
  { id: 'electrique', name: 'Électrique' },
  { id: 'gpl', name: 'GPL' },
];

export const transmissionTypes = [
  { id: 'manuelle', name: 'Manuelle' },
  { id: 'automatique', name: 'Automatique' },
  { id: 'cvt', name: 'CVT' },
  { id: 'semi-auto', name: 'Semi-automatique' },
];

// Données de démonstration pour les véhicules en vente
export const mockVehiclesForSale = [
  {
    id: 'v1',
    title: 'Toyota Camry 2020',
    brand: 'Toyota',
    model: 'Camry',
    year: 2020,
    price: 28000000, // Prix en FC (Francs Congolais)
    priceUSD: 15000,
    category: 'sedan',
    condition: 'excellent',
    fuelType: 'gasoline',
    transmission: 'automatic',
    mileage: 45000,
    location: 'Kinshasa, Gombe',
    seller: {
      id: 'seller1',
      name: 'Jean Mukamba',
      phone: '+243 978 123 456',
      rating: 4.7,
      verified: true,
    },
    images: [
      require('../../assets/cars/white.png'),
      require('../../assets/cars/white.png'),
      require('../../assets/cars/white.png'),
    ],
    features: [
      'Climatisation',
      'Système de navigation',
      'Bluetooth',
      'Caméra de recul',
      'Sièges en cuir',
      'Toit ouvrant',
    ],
    description: 'Véhicule en excellent état, entretien régulier, toutes réparations à jour. Idéal pour VTC ou usage personnel.',
    posted: '2024-01-15T10:00:00Z',
    views: 127,
    favorites: 8,
    available: true,
  },
  {
    id: 'v2',
    title: 'Hyundai H1 2018',
    brand: 'Hyundai',
    model: 'H1',
    year: 2018,
    price: 35000000,
    priceUSD: 18500,
    category: 'minibus',
    condition: 'good',
    fuelType: 'diesel',
    transmission: 'manual',
    mileage: 78000,
    location: 'Kinshasa, Lemba',
    seller: {
      id: 'seller2',
      name: 'Marie Kasongo',
      phone: '+243 898 765 432',
      rating: 4.9,
      verified: true,
    },
    images: [
      require('../../assets/cars/white.png'),
      require('../../assets/cars/white.png'),
    ],
    features: [
      '12 places',
      'Climatisation',
      'Radio/CD',
      'Vitres électriques',
    ],
    description: 'Minibus parfait pour transport public ou familial. Moteur diesel économique, bien entretenu.',
    posted: '2024-01-12T14:30:00Z',
    views: 89,
    favorites: 12,
    available: true,
  },
  {
    id: 'v3',
    title: 'Mercedes-Benz Classe G 2019',
    brand: 'Mercedes-Benz',
    model: 'Classe G',
    year: 2019,
    price: 85000000,
    priceUSD: 45000,
    category: 'luxury',
    condition: 'excellent',
    fuelType: 'gasoline',
    transmission: 'automatic',
    mileage: 25000,
    location: 'Kinshasa, Gombe',
    seller: {
      id: 'seller3',
      name: 'Patrick Tshisekedi',
      phone: '+243 971 234 567',
      rating: 5.0,
      verified: true,
    },
    images: [
      require('../../assets/cars/luxe.png'),
      require('../../assets/cars/luxe.png'),
      require('../../assets/cars/luxe.png'),
    ],
    features: [
      'Intérieur cuir premium',
      'Système multimédia avancé',
      'Caméras 360°',
      'Sièges chauffants',
      'Suspension pneumatique',
      'Toit panoramique',
      'Système de navigation premium',
    ],
    description: 'Véhicule de luxe en parfait état, peu roulé, entretien Mercedes officiel. Idéal pour services VIP.',
    posted: '2024-01-10T09:15:00Z',
    views: 203,
    favorites: 25,
    available: true,
  },
  {
    id: 'v4',
    title: 'Yamaha DT 125 2021',
    brand: 'Yamaha',
    model: 'DT 125',
    year: 2021,
    price: 3500000,
    priceUSD: 1850,
    category: 'motorcycle',
    condition: 'excellent',
    fuelType: 'gasoline',
    transmission: 'manual',
    mileage: 8000,
    location: 'Kinshasa, Matonge',
    seller: {
      id: 'seller4',
      name: 'André Kabila',
      phone: '+243 978 456 789',
      rating: 4.5,
      verified: false,
    },
    images: [
      require('../../assets/cars/motorbike.png'),
      require('../../assets/cars/motorbike.png'),
    ],
    features: [
      'Moteur 125cc',
      'Démarrage électrique',
      'Coffre arrière',
      'Phares LED',
    ],
    description: 'Moto parfaite pour livraisons rapides ou transport personnel. Très économique en carburant.',
    posted: '2024-01-08T16:45:00Z',
    views: 156,
    favorites: 18,
    available: true,
  },
  {
    id: 'v5',
    title: 'Toyota RAV4 2022',
    brand: 'Toyota',
    model: 'RAV4',
    year: 2022,
    price: 45000000,
    priceUSD: 24000,
    category: 'suv',
    condition: 'new',
    fuelType: 'hybrid',
    transmission: 'automatic',
    mileage: 5000,
    location: 'Kinshasa, Ngaliema',
    seller: {
      id: 'seller5',
      name: 'Sophie Mbuyi',
      phone: '+243 898 123 789',
      rating: 4.8,
      verified: true,
    },
    images: [
      require('../../assets/cars/bluecars.png'),
      require('../../assets/cars/bluecars.png'),
      require('../../assets/cars/bluecars.png'),
    ],
    features: [
      'Moteur hybride',
      'Système Toyota Safety',
      'Écran tactile 9 pouces',
      'Apple CarPlay/Android Auto',
      'Caméras multiples',
      'Sièges chauffants',
    ],
    description: 'SUV hybride quasi-neuf, technologie de pointe, très économique. Garantie constructeur valide.',
    posted: '2024-01-05T11:20:00Z',
    views: 301,
    favorites: 42,
    available: true,
  },
];

// Fonctions utilitaires
export const formatPrice = (price) => {
  return price.toLocaleString('fr-CD') + ' FC';
};

export const formatPriceUSD = (priceUSD) => {
  return '$' + priceUSD.toLocaleString('en-US');
};

export const getConditionColor = (conditionId) => {
  const condition = vehicleConditions.find(c => c.id === conditionId);
  return condition ? condition.color : '#8E8E93';
};

export const getCategoryName = (categoryId) => {
  const category = vehicleCategories.find(c => c.id === categoryId);
  return category ? category.name : 'Autre';
};

export const getConditionName = (conditionId) => {
  const condition = vehicleConditions.find(c => c.id === conditionId);
  return condition ? condition.name : 'Non spécifié';
};

export const getFuelTypeName = (fuelTypeId) => {
  const fuelType = vehicleFuelTypes.find(f => f.id === fuelTypeId);
  return fuelType ? fuelType.name : 'Non spécifié';
};

export const getTransmissionName = (transmissionId) => {
  const transmission = vehicleTransmissions.find(t => t.id === transmissionId);
  return transmission ? transmission.name : 'Non spécifié';
};

export const calculateDaysAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
  return `Il y a ${Math.floor(diffDays / 30)} mois`;
}; 