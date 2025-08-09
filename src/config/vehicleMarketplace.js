// Configuration et données de démonstration pour le marketplace automobile
<<<<<<< HEAD
import { colors } from './designTokens';

=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
export const vehicleCategories = [
  { id: 'sedan', name: 'Berline', icon: 'car-outline' },
  { id: 'suv', name: 'SUV', icon: 'car-sport-outline' },
  { id: 'pickup', name: 'Pick-up', icon: 'car-outline' },
  { id: 'minibus', name: 'Minibus', icon: 'bus-outline' },
  { id: 'motorcycle', name: 'Moto', icon: 'bicycle-outline' },
  { id: 'luxury', name: 'Luxe', icon: 'diamond-outline' },
];

export const vehicleConditions = [
<<<<<<< HEAD
  { id: 'new', name: 'Neuf', color: colors.brand.success },
  { id: 'excellent', name: 'Excellent état', color: colors.brand.success },
  { id: 'good', name: 'Bon état', color: colors.brand.warning },
  { id: 'fair', name: 'État correct', color: colors.brand.accent },
  { id: 'poor', name: 'À rénover', color: colors.brand.error },
=======
  { id: 'new', name: 'Neuf', color: '#4CAF50' },
  { id: 'excellent', name: 'Excellent état', color: '#8BC34A' },
  { id: 'good', name: 'Bon état', color: '#FFC107' },
  { id: 'fair', name: 'État correct', color: '#FF9800' },
  { id: 'poor', name: 'À rénover', color: '#F44336' },
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
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
<<<<<<< HEAD
    title: 'Toyota Prado 2025',
    brand: 'Toyota',
    model: 'Prado',
    year: 2025,
    price: 79000, // Prix total en USD TTC
    priceFirstInstallment: 62000, // Première tranche
    priceSecondInstallment: 17000, // Deuxième tranche (calculée automatiquement)
    mileage: 0, // Kilométrage en km
=======
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
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    images: [
      require('../../assets/cars/white.png'),
      require('../../assets/cars/white.png'),
      require('../../assets/cars/white.png'),
    ],
<<<<<<< HEAD
    posted: '2024-01-15T10:00:00Z',
    available: true,
    // Spécifications techniques
    specifications: {
      cylinders: 4,
      transmission: 'Automatique',
      seats: 5,
      fuelType: 'Essence',
    },
    // Équipements et options
    equipment: [
      'Pneu de rechange',
      'Sièges en cuir',
      'Lecteur vidéo et CD',
      'Radio',
      'Climatisation'
    ],
    // Informations logistiques
    logistics: {
      priceIncludesFreightAndCustoms: true,
      deliveryTime: '4-6 semaines',
      citiesServed: ['Kinshasa', 'Lubumbashi', 'Kolwezi']
    },
    condition: 'new',
    location: 'Kinshasa',
    description: 'Toyota Prado 2025 neuf, équipé de toutes les options modernes. Prix incluant le fret et la douane.',
    seller: {
      name: 'Zeurk Motors',
      rating: 4.9,
      verified: true,
      phone: '+243 123 456 789',
    },
    views: 245,
    favorites: 18,
=======
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
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  },
  {
    id: 'v2',
    title: 'Hyundai H1 2018',
    brand: 'Hyundai',
    model: 'H1',
    year: 2018,
<<<<<<< HEAD
    price: 18500, // Prix total en USD
    priceFirstInstallment: 12000, // Première tranche
    priceSecondInstallment: 6500, // Deuxième tranche
    mileage: 78000, // Kilométrage en km
=======
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
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    images: [
      require('../../assets/cars/white.png'),
      require('../../assets/cars/white.png'),
    ],
<<<<<<< HEAD
    posted: '2024-01-12T14:30:00Z',
    available: true,
    specifications: {
      cylinders: 4,
      transmission: 'Manuelle',
      seats: 8,
      fuelType: 'Diesel',
    },
    equipment: [
      'Pneu de rechange',
      'Radio',
      'Climatisation',
      'Sièges en tissu'
    ],
    logistics: {
      priceIncludesFreightAndCustoms: true,
      deliveryTime: '2-3 semaines',
      citiesServed: ['Kinshasa', 'Lubumbashi']
    },
    condition: 'good',
    location: 'Lubumbashi',
    description: 'Hyundai H1 2018 en bon état, idéal pour le transport de passagers.',
    seller: {
      name: 'Auto Congo',
      rating: 4.5,
      verified: true,
      phone: '+243 987 654 321',
    },
    views: 156,
    favorites: 12,
=======
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
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  },
  {
    id: 'v3',
    title: 'Mercedes-Benz Classe G 2019',
    brand: 'Mercedes-Benz',
    model: 'Classe G',
    year: 2019,
<<<<<<< HEAD
    price: 45000, // Prix total en USD
    priceFirstInstallment: 30000, // Première tranche
    priceSecondInstallment: 15000, // Deuxième tranche
    mileage: 25000, // Kilométrage en km
=======
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
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    images: [
      require('../../assets/cars/luxe.png'),
      require('../../assets/cars/luxe.png'),
      require('../../assets/cars/luxe.png'),
    ],
<<<<<<< HEAD
    posted: '2024-01-10T09:15:00Z',
    available: true,
    specifications: {
      cylinders: 8,
      transmission: 'Automatique',
      seats: 5,
      fuelType: 'Essence',
    },
    equipment: [
      'Pneu de rechange',
      'Sièges en cuir',
      'Lecteur vidéo et CD',
      'Radio',
      'Climatisation'
    ],
    logistics: {
      priceIncludesFreightAndCustoms: true,
      deliveryTime: '3-4 semaines',
      citiesServed: ['Kinshasa', 'Lubumbashi', 'Kolwezi']
    },
    condition: 'excellent',
    location: 'Kinshasa',
    description: 'Mercedes-Benz Classe G 2019 en excellent état, véhicule de luxe avec toutes les options.',
    seller: {
      name: 'Luxury Motors',
      rating: 4.8,
      verified: true,
      phone: '+243 555 123 456',
    },
    views: 189,
    favorites: 25,
=======
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
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  },
  {
    id: 'v4',
    title: 'Yamaha DT 125 2021',
    brand: 'Yamaha',
    model: 'DT 125',
    year: 2021,
<<<<<<< HEAD
    price: 1850, // Prix total en USD
    priceFirstInstallment: 1200, // Première tranche
    priceSecondInstallment: 650, // Deuxième tranche
    mileage: 8000, // Kilométrage en km
=======
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
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    images: [
      require('../../assets/cars/motorbike.png'),
      require('../../assets/cars/motorbike.png'),
    ],
<<<<<<< HEAD
    posted: '2024-01-08T16:45:00Z',
    available: true,
    specifications: {
      cylinders: 1,
      transmission: 'Manuelle',
      seats: 2,
      fuelType: 'Essence',
    },
    equipment: [
      'Casque inclus',
      'Kit de réparation',
      'Antivol'
    ],
    logistics: {
      priceIncludesFreightAndCustoms: false,
      deliveryTime: '1-2 semaines',
      citiesServed: ['Kinshasa', 'Lubumbashi']
    },
    condition: 'good',
    location: 'Kinshasa',
    description: 'Yamaha DT 125 2021 en bon état, parfait pour les déplacements urbains.',
    seller: {
      name: 'Moto Plus',
      rating: 4.3,
      verified: true,
      phone: '+243 777 888 999',
    },
    views: 98,
    favorites: 8,
=======
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
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  },
  {
    id: 'v5',
    title: 'Toyota RAV4 2022',
    brand: 'Toyota',
    model: 'RAV4',
    year: 2022,
<<<<<<< HEAD
    price: 24000, // Prix total en USD
    priceFirstInstallment: 16000, // Première tranche
    priceSecondInstallment: 8000, // Deuxième tranche
    mileage: 5000, // Kilométrage en km
=======
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
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    images: [
      require('../../assets/cars/bluecars.png'),
      require('../../assets/cars/bluecars.png'),
      require('../../assets/cars/bluecars.png'),
    ],
<<<<<<< HEAD
    posted: '2024-01-05T11:20:00Z',
    available: true,
    specifications: {
      cylinders: 4,
      transmission: 'Automatique',
      seats: 5,
      fuelType: 'Hybride',
    },
    equipment: [
      'Pneu de rechange',
      'Sièges en cuir',
      'Radio',
      'Climatisation',
      'Système de navigation'
    ],
    logistics: {
      priceIncludesFreightAndCustoms: true,
      deliveryTime: '2-3 semaines',
      citiesServed: ['Kinshasa', 'Lubumbashi', 'Kolwezi']
    },
    condition: 'excellent',
    location: 'Lubumbashi',
    description: 'Toyota RAV4 2022 hybride en excellent état, économique et fiable.',
    seller: {
      name: 'Toyota Center',
      rating: 4.7,
      verified: true,
      phone: '+243 666 777 888',
    },
    views: 134,
    favorites: 15,
=======
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
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  },
];

// Fonctions utilitaires
export const formatPrice = (price) => {
<<<<<<< HEAD
  if (price == null || price === undefined) return '0 FC';
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  return price.toLocaleString('fr-CD') + ' FC';
};

export const formatPriceUSD = (priceUSD) => {
<<<<<<< HEAD
  if (priceUSD == null || priceUSD === undefined) return '$0';
=======
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
  return '$' + priceUSD.toLocaleString('en-US');
};

export const getConditionColor = (conditionId) => {
  const condition = vehicleConditions.find(c => c.id === conditionId);
<<<<<<< HEAD
  return condition ? condition.color : colors.text.secondary;
};

export const getConditionStyle = (conditionId) => {
  const color = getConditionColor(conditionId);
  return {
    backgroundColor: `${color}15`, // 15% opacity background
    borderColor: `${color}40`, // 40% opacity border
    color: color,
  };
=======
  return condition ? condition.color : '#8E8E93';
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
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
<<<<<<< HEAD
};

// UI Styles conformes aux standards de design
export const vehicleMarketplaceStyles = {
  // Card styles following design standards
  vehicleCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.ui.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  
  // Elevated card for featured vehicles
  featuredVehicleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.ui.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  
  // Price display styles
  priceContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  
  priceText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  
  priceUSDText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '400',
  },
  
  // Condition badge styles
  conditionBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  
  conditionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Category styles
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  
  categoryText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '400',
    marginLeft: 4,
  },
  
  // Vehicle info styles
  vehicleTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  vehicleSubtitle: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '400',
  },
  
  vehicleLocation: {
    color: colors.text.tertiary,
    fontSize: 12,
    fontWeight: '400',
  },
  
  // Seller info styles
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: 8,
  },
  
  sellerName: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  
  sellerRating: {
    color: colors.brand.warning,
    fontSize: 12,
    fontWeight: '400',
  },
  
  // Filter styles
  filterContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.ui.border,
    padding: 16,
  },
  
  filterTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  
  filterOption: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  
  filterOptionActive: {
    backgroundColor: colors.brand.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  
  filterOptionText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '400',
  },
  
  filterOptionActiveText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
};
=======
}; 
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
