// Local landmarks for Kinshasa - commonly known pickup points
export const kinshasaLandmarks = [
  // Major Markets
  { name: "Marché Central", address: "Boulevard du 30 Juin, Kinshasa", type: "market", icon: "storefront" },
  { name: "Marché de la Liberté", address: "Avenue de la Liberté, Kinshasa", type: "market", icon: "storefront" },
  { name: "Marché Gambela", address: "Commune de Barumbu, Kinshasa", type: "market", icon: "storefront" },
  
  // Universities & Schools
  { name: "Université de Kinshasa (UNIKIN)", address: "Mont Amba, Kinshasa", type: "education", icon: "school" },
  { name: "Université Protestante du Congo", address: "Lingwala, Kinshasa", type: "education", icon: "school" },
  { name: "Institut Supérieur de Commerce", address: "Gombe, Kinshasa", type: "education", icon: "school" },
  
  // Hospitals
  { name: "Hôpital Général de Kinshasa", address: "Lingwala, Kinshasa", type: "hospital", icon: "local-hospital" },
  { name: "Clinique Nganda", address: "Gombe, Kinshasa", type: "hospital", icon: "local-hospital" },
  { name: "Hôpital Mama Yemo", address: "Kalamu, Kinshasa", type: "hospital", icon: "local-hospital" },
  
  // Transportation Hubs
  { name: "Aéroport de N'djili", address: "N'djili, Kinshasa", type: "transport", icon: "local-airport" },
  { name: "Gare Centrale", address: "Gombe, Kinshasa", type: "transport", icon: "train" },
  { name: "Port de Kinshasa", address: "Gombe, Kinshasa", type: "transport", icon: "directions-boat" },
  
  // Hotels & Restaurants
  { name: "Hôtel Pullman", address: "4 Avenue Batetela, Kinshasa", type: "hotel", icon: "hotel" },
  { name: "Hôtel Memling", address: "5 Avenue des Aviateurs, Kinshasa", type: "hotel", icon: "hotel" },
  { name: "Restaurant Chez Ntemba", address: "Gombe, Kinshasa", type: "restaurant", icon: "restaurant" },
  
  // Shopping Centers
  { name: "Centre Commercial Zando", address: "Avenue du Commerce, Kinshasa", type: "shopping", icon: "shopping-mall" },
  { name: "City Market", address: "Gombe, Kinshasa", type: "shopping", icon: "shopping-mall" },
  
  // Government & Offices
  { name: "Palais de la Nation", address: "Gombe, Kinshasa", type: "government", icon: "account-balance" },
  { name: "Assemblée Nationale", address: "Gombe, Kinshasa", type: "government", icon: "account-balance" },
  { name: "Ministère des Transports", address: "Gombe, Kinshasa", type: "government", icon: "account-balance" },
  
  // Sports & Entertainment
  { name: "Stade des Martyrs", address: "Boulevard Triomphal, Kinshasa", type: "sports", icon: "sports-soccer" },
  { name: "Stade Tata Raphaël", address: "Kalamu, Kinshasa", type: "sports", icon: "sports-soccer" },
  
  // Religious Places
  { name: "Cathédrale Notre-Dame du Congo", address: "Gombe, Kinshasa", type: "religious", icon: "church" },
  { name: "Mosquée Centrale", address: "Kinshasa Centre", type: "religious", icon: "mosque" },
  
  // Popular Neighborhoods/Areas
  { name: "Rond-point Ngaba", address: "Ngaba, Kinshasa", type: "area", icon: "place" },
  { name: "Carrefour Victoire", address: "Kalamu, Kinshasa", type: "area", icon: "place" },
  { name: "Place de la Poste", address: "Gombe, Kinshasa", type: "area", icon: "place" },
  { name: "Rond-point Socimat", address: "Gombe, Kinshasa", type: "area", icon: "place" },
];

// Dictionnaire d'abréviations courantes
const abbreviationMap = {
  // Types de voies
  'av': 'avenue',
  'ave': 'avenue',
  'bd': 'boulevard',
  'blvd': 'boulevard',
  'r': 'rue',
  'rd': 'rond',
  'rp': 'rond-point',
  'pl': 'place',
  'sq': 'square',
  'st': 'saint',
  'ste': 'sainte',
  
  // Mots courants
  'ctr': 'centre',
  'ctre': 'centre',
  'com': 'commercial',
  'comm': 'commercial',
  'univ': 'université',
  'uni': 'université',
  'hop': 'hôpital',
  'hosp': 'hôpital',
  'gare': 'gare',
  'aero': 'aéroport',
  'aéro': 'aéroport',
  'march': 'marché',
  'mche': 'marché',
  
  // Lieux spécifiques à Kinshasa
  'kin': 'kinshasa',
  'ndj': 'ndjili',
  'unikin': 'université de kinshasa',
  'mama yemo': 'hôpital mama yemo',
  'pullman': 'hôtel pullman',
  'memling': 'hôtel memling'
};

// Fonction pour calculer la distance de Levenshtein (similarité entre chaînes)
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Fonction pour calculer le score de similarité (0-1, 1 étant identique)
const calculateSimilarity = (str1, str2) => {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(str1, str2);
  return 1 - (distance / maxLength);
};

// Fonction pour normaliser et étendre la requête avec les abréviations
const normalizeQuery = (query) => {
  let normalized = query.toLowerCase().trim();
  
  // Remplacer les abréviations par leurs formes complètes
  const words = normalized.split(/\s+/);
  const expandedWords = words.map(word => {
    // Enlever la ponctuation pour la correspondance
    const cleanWord = word.replace(/[.,;:!?]/g, '');
    return abbreviationMap[cleanWord] || word;
  });
  
  return {
    original: normalized,
    expanded: expandedWords.join(' '),
    words: words,
    expandedWords: expandedWords
  };
};

// Fonction pour vérifier si une chaîne contient des mots similaires
const containsSimilarWords = (text, queryWords, threshold = 0.7) => {
  const textWords = text.toLowerCase().split(/\s+/);
  
  return queryWords.some(queryWord => {
    if (queryWord.length < 3) {
      // Pour les mots courts, recherche exacte ou inclusion
      return textWords.some(textWord => 
        textWord.includes(queryWord) || queryWord.includes(textWord)
      );
    }
    
    // Pour les mots plus longs, utiliser la similarité
    return textWords.some(textWord => {
      const similarity = calculateSimilarity(queryWord, textWord);
      return similarity >= threshold;
    });
  });
};

// Fonction de recherche intelligente améliorée
export const searchLandmarks = (query, limit = 5) => {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = normalizeQuery(query);
  const results = [];
  
  kinshasaLandmarks.forEach(landmark => {
    const landmarkName = landmark.name.toLowerCase();
    const landmarkAddress = landmark.address.toLowerCase();
    const landmarkType = landmark.type.toLowerCase();
    
    let score = 0;
    let matchType = '';
    
    // 1. Correspondance exacte (score le plus élevé)
    if (landmarkName.includes(normalizedQuery.original) || 
        landmarkAddress.includes(normalizedQuery.original)) {
      score = 100;
      matchType = 'exact';
    }
    // 2. Correspondance avec abréviations étendues
    else if (landmarkName.includes(normalizedQuery.expanded) || 
             landmarkAddress.includes(normalizedQuery.expanded)) {
      score = 90;
      matchType = 'abbreviation';
    }
    // 3. Correspondance de mots individuels avec tolérance aux fautes
    else if (containsSimilarWords(landmarkName, normalizedQuery.expandedWords, 0.7) ||
             containsSimilarWords(landmarkAddress, normalizedQuery.expandedWords, 0.7)) {
      score = 80;
      matchType = 'fuzzy';
    }
    // 4. Correspondance de type
    else if (landmarkType.includes(normalizedQuery.original) || 
             landmarkType.includes(normalizedQuery.expanded)) {
      score = 70;
      matchType = 'type';
    }
    // 5. Correspondance partielle avec seuil de similarité plus bas
    else if (containsSimilarWords(landmarkName, normalizedQuery.expandedWords, 0.6) ||
             containsSimilarWords(landmarkAddress, normalizedQuery.expandedWords, 0.6)) {
      score = 60;
      matchType = 'partial';
    }
    
    // Bonus pour les correspondances multiples
    let bonusScore = 0;
    if (landmarkName.includes(normalizedQuery.original) && landmarkAddress.includes(normalizedQuery.original)) {
      bonusScore += 10;
    }
    
    // Bonus pour les lieux populaires
    if (['market', 'transport', 'education', 'hospital'].includes(landmark.type)) {
      bonusScore += 5;
    }
    
    if (score > 0) {
      results.push({
        ...landmark,
        description: `${landmark.name} • ${landmark.address}`,
        place_id: `landmark_${landmark.name.replace(/\s+/g, '_').toLowerCase()}`,
        searchScore: score + bonusScore,
        matchType: matchType
      });
    }
  });
  
  // Trier par score décroissant et retourner les meilleurs résultats
  return results
    .sort((a, b) => b.searchScore - a.searchScore)
    .slice(0, limit)
    .map(({ searchScore, matchType, ...landmark }) => landmark);
};

// Get landmarks by type
export const getLandmarksByType = (type) => {
  return kinshasaLandmarks.filter(landmark => landmark.type === type);
};

// Get popular landmarks (most commonly used as pickup points)
export const getPopularLandmarks = () => {
  return kinshasaLandmarks
    .filter(landmark => 
      ['market', 'transport', 'shopping', 'education', 'hospital'].includes(landmark.type)
    )
    .slice(0, 8);
};

// Lieux populaires par ville - système intelligent
const popularPlacesByCity = {
  // République Démocratique du Congo
  'Kinshasa': [
    { name: "Centre Commercial Zando", address: "Avenue du Commerce, Kinshasa", icon: "storefront" },
    { name: "Aéroport de N'djili", address: "N'djili, Kinshasa", icon: "local-airport" },
    { name: "Marché Central", address: "Boulevard du 30 Juin, Kinshasa", icon: "shopping-cart" },
    { name: "Université de Kinshasa", address: "Mont Amba, Kinshasa", icon: "school" },
    { name: "Stade des Martyrs", address: "Boulevard Triomphal, Kinshasa", icon: "sports-soccer" }
  ],
  'Lubumbashi': [
    { name: "Aéroport de Lubumbashi", address: "Aéroport de Lubumbashi, Lubumbashi", icon: "local-airport" },
    { name: "Université de Lubumbashi", address: "Université de Lubumbashi, Lubumbashi", icon: "school" },
    { name: "Marché Central", address: "Centre-ville, Lubumbashi", icon: "shopping-cart" },
    { name: "Stade TP Mazembe", address: "Stade TP Mazembe, Lubumbashi", icon: "sports-soccer" },
    { name: "Gare de Lubumbashi", address: "Gare de Lubumbashi, Lubumbashi", icon: "train" }
  ],
  'Goma': [
    { name: "Aéroport de Goma", address: "Aéroport de Goma, Goma", icon: "local-airport" },
    { name: "Université de Goma", address: "Université de Goma, Goma", icon: "school" },
    { name: "Marché Central", address: "Centre-ville, Goma", icon: "shopping-cart" },
    { name: "Lac Kivu", address: "Lac Kivu, Goma", icon: "water" },
    { name: "Frontière Rwanda", address: "Frontière Rwanda-RDC, Goma", icon: "location-on" }
  ],

  // France
  'Paris': [
    { name: "Aéroport Charles de Gaulle", address: "Aéroport Charles de Gaulle, Paris", icon: "local-airport" },
    { name: "Gare du Nord", address: "Gare du Nord, Paris", icon: "train" },
    { name: "Tour Eiffel", address: "Tour Eiffel, Paris", icon: "place" },
    { name: "Champs-Élysées", address: "Champs-Élysées, Paris", icon: "storefront" },
    { name: "Louvre", address: "Musée du Louvre, Paris", icon: "museum" }
  ],
  'Lyon': [
    { name: "Aéroport Lyon-Saint Exupéry", address: "Aéroport Lyon-Saint Exupéry, Lyon", icon: "local-airport" },
    { name: "Gare de Lyon Part-Dieu", address: "Gare de Lyon Part-Dieu, Lyon", icon: "train" },
    { name: "Vieux Lyon", address: "Vieux Lyon, Lyon", icon: "place" },
    { name: "Université Lyon 1", address: "Université Lyon 1, Lyon", icon: "school" },
    { name: "Centre Commercial Part-Dieu", address: "Centre Commercial Part-Dieu, Lyon", icon: "storefront" }
  ],
  'Marseille': [
    { name: "Aéroport Marseille Provence", address: "Aéroport Marseille Provence, Marseille", icon: "local-airport" },
    { name: "Gare Saint-Charles", address: "Gare Saint-Charles, Marseille", icon: "train" },
    { name: "Vieux-Port", address: "Vieux-Port, Marseille", icon: "directions-boat" },
    { name: "Notre-Dame de la Garde", address: "Notre-Dame de la Garde, Marseille", icon: "church" },
    { name: "Université d'Aix-Marseille", address: "Université d'Aix-Marseille, Marseille", icon: "school" }
  ],

  // Belgique
  'Brussels': [
    { name: "Aéroport de Bruxelles", address: "Aéroport de Bruxelles, Brussels", icon: "local-airport" },
    { name: "Gare Centrale", address: "Gare Centrale, Brussels", icon: "train" },
    { name: "Grand-Place", address: "Grand-Place, Brussels", icon: "place" },
    { name: "Université Libre de Bruxelles", address: "Université Libre de Bruxelles, Brussels", icon: "school" },
    { name: "Atomium", address: "Atomium, Brussels", icon: "place" }
  ],
  'Bruxelles': [
    { name: "Aéroport de Bruxelles", address: "Aéroport de Bruxelles, Bruxelles", icon: "local-airport" },
    { name: "Gare Centrale", address: "Gare Centrale, Bruxelles", icon: "train" },
    { name: "Grand-Place", address: "Grand-Place, Bruxelles", icon: "place" },
    { name: "Université Libre de Bruxelles", address: "Université Libre de Bruxelles, Bruxelles", icon: "school" },
    { name: "Atomium", address: "Atomium, Bruxelles", icon: "place" }
  ],

  // Canada
  'Montreal': [
    { name: "Aéroport Montréal-Trudeau", address: "Aéroport Montréal-Trudeau, Montreal", icon: "local-airport" },
    { name: "Gare Centrale", address: "Gare Centrale, Montreal", icon: "train" },
    { name: "Université McGill", address: "Université McGill, Montreal", icon: "school" },
    { name: "Vieux-Montréal", address: "Vieux-Montréal, Montreal", icon: "place" },
    { name: "Centre-ville", address: "Centre-ville, Montreal", icon: "storefront" }
  ],
  'Montréal': [
    { name: "Aéroport Montréal-Trudeau", address: "Aéroport Montréal-Trudeau, Montréal", icon: "local-airport" },
    { name: "Gare Centrale", address: "Gare Centrale, Montréal", icon: "train" },
    { name: "Université McGill", address: "Université McGill, Montréal", icon: "school" },
    { name: "Vieux-Montréal", address: "Vieux-Montréal, Montréal", icon: "place" },
    { name: "Centre-ville", address: "Centre-ville, Montréal", icon: "storefront" }
  ],
  'Toronto': [
    { name: "Aéroport Pearson", address: "Aéroport Pearson, Toronto", icon: "local-airport" },
    { name: "Union Station", address: "Union Station, Toronto", icon: "train" },
    { name: "CN Tower", address: "CN Tower, Toronto", icon: "place" },
    { name: "Université de Toronto", address: "Université de Toronto, Toronto", icon: "school" },
    { name: "Eaton Centre", address: "Eaton Centre, Toronto", icon: "storefront" }
  ],

  // États-Unis
  'New York': [
    { name: "JFK Airport", address: "JFK Airport, New York", icon: "local-airport" },
    { name: "Times Square", address: "Times Square, New York", icon: "place" },
    { name: "Central Park", address: "Central Park, New York", icon: "park" },
    { name: "Columbia University", address: "Columbia University, New York", icon: "school" },
    { name: "Grand Central", address: "Grand Central Terminal, New York", icon: "train" }
  ],
  'Los Angeles': [
    { name: "LAX Airport", address: "LAX Airport, Los Angeles", icon: "local-airport" },
    { name: "Hollywood", address: "Hollywood, Los Angeles", icon: "place" },
    { name: "UCLA", address: "UCLA, Los Angeles", icon: "school" },
    { name: "Santa Monica Pier", address: "Santa Monica Pier, Los Angeles", icon: "place" },
    { name: "Downtown LA", address: "Downtown LA, Los Angeles", icon: "storefront" }
  ],

  // Royaume-Uni
  'London': [
    { name: "Heathrow Airport", address: "Heathrow Airport, London", icon: "local-airport" },
    { name: "King's Cross Station", address: "King's Cross Station, London", icon: "train" },
    { name: "Big Ben", address: "Big Ben, London", icon: "place" },
    { name: "Oxford Street", address: "Oxford Street, London", icon: "storefront" },
    { name: "University College London", address: "University College London, London", icon: "school" }
  ],

  // Autres pays africains
  'Lagos': [
    { name: "Aéroport de Lagos", address: "Aéroport de Lagos, Lagos", icon: "local-airport" },
    { name: "Victoria Island", address: "Victoria Island, Lagos", icon: "place" },
    { name: "Université de Lagos", address: "Université de Lagos, Lagos", icon: "school" },
    { name: "Marché de Balogun", address: "Marché de Balogun, Lagos", icon: "shopping-cart" },
    { name: "Ikeja", address: "Ikeja, Lagos", icon: "storefront" }
  ],
  'Dakar': [
    { name: "Aéroport Blaise Diagne", address: "Aéroport Blaise Diagne, Dakar", icon: "local-airport" },
    { name: "Université Cheikh Anta Diop", address: "Université Cheikh Anta Diop, Dakar", icon: "school" },
    { name: "Plateau", address: "Plateau, Dakar", icon: "place" },
    { name: "Marché Sandaga", address: "Marché Sandaga, Dakar", icon: "shopping-cart" },
    { name: "Île de Gorée", address: "Île de Gorée, Dakar", icon: "directions-boat" }
  ],
  'Abidjan': [
    { name: "Aéroport Félix Houphouët-Boigny", address: "Aéroport Félix Houphouët-Boigny, Abidjan", icon: "local-airport" },
    { name: "Plateau", address: "Plateau, Abidjan", icon: "place" },
    { name: "Université Félix Houphouët-Boigny", address: "Université Félix Houphouët-Boigny, Abidjan", icon: "school" },
    { name: "Marché de Treichville", address: "Marché de Treichville, Abidjan", icon: "shopping-cart" },
    { name: "Cocody", address: "Cocody, Abidjan", icon: "storefront" }
  ]
};

// Lieux populaires génériques pour les villes non répertoriées
const genericPopularPlaces = [
  { name: "Aéroport", address: "Aéroport principal", icon: "local-airport" },
  { name: "Gare", address: "Gare principale", icon: "train" },
  { name: "Centre-ville", address: "Centre-ville", icon: "storefront" },
  { name: "Université", address: "Université principale", icon: "school" },
  { name: "Hôpital", address: "Hôpital principal", icon: "local-hospital" }
];

/**
 * Obtient les lieux populaires adaptés à la ville de l'utilisateur
 * @param {string} userCity - La ville détectée de l'utilisateur
 * @returns {Array} - Liste des lieux populaires pour cette ville
 */
export const getPopularPlacesForCity = (userCity) => {
  if (!userCity || userCity === 'Ville inconnue') {
    // Retourner les lieux de Kinshasa par défaut
    return popularPlacesByCity['Kinshasa'] || genericPopularPlaces;
  }

  // Normaliser le nom de la ville (enlever les accents, mettre en forme)
  const normalizedCity = userCity.trim();
  
  // Recherche directe
  if (popularPlacesByCity[normalizedCity]) {
    return popularPlacesByCity[normalizedCity];
  }

  // Recherche insensible à la casse
  const cityKey = Object.keys(popularPlacesByCity).find(
    key => key.toLowerCase() === normalizedCity.toLowerCase()
  );
  
  if (cityKey) {
    return popularPlacesByCity[cityKey];
  }

  // Recherche partielle (pour gérer les variations comme "Paris 1er", "Montreal QC", etc.)
  const partialMatch = Object.keys(popularPlacesByCity).find(
    key => normalizedCity.toLowerCase().includes(key.toLowerCase()) || 
           key.toLowerCase().includes(normalizedCity.toLowerCase())
  );
  
  if (partialMatch) {
    return popularPlacesByCity[partialMatch];
  }

  // Si aucune correspondance, générer des lieux génériques avec le nom de la ville
  return genericPopularPlaces.map(place => ({
    ...place,
    address: `${place.address}, ${normalizedCity}`
  }));
};

/**
 * Recherche intelligente qui combine les landmarks locaux et les lieux populaires
 * @param {string} query - Terme de recherche
 * @param {string} userCity - Ville de l'utilisateur
 * @param {number} limit - Nombre maximum de résultats
 * @returns {Array} - Résultats de recherche combinés
 */
export const searchPlacesIntelligent = (query, userCity, limit = 5) => {
  if (!query || query.length < 2) return [];

  // Rechercher dans les landmarks locaux (Kinshasa)
  const landmarkResults = searchLandmarks(query, Math.ceil(limit / 2));
  
  // Rechercher dans les lieux populaires de la ville de l'utilisateur
  const cityPlaces = getPopularPlacesForCity(userCity);
  const cityResults = [];
  
  if (cityPlaces && userCity !== 'Kinshasa') {
    const normalizedQuery = query.toLowerCase();
    
    cityPlaces.forEach(place => {
      const placeName = place.name.toLowerCase();
      const placeAddress = place.address.toLowerCase();
      
      if (placeName.includes(normalizedQuery) || 
          placeAddress.includes(normalizedQuery) ||
          normalizedQuery.includes(placeName.split(' ')[0])) {
        cityResults.push({
          ...place,
          description: `${place.name} • ${place.address}`,
          place_id: `city_place_${place.name.replace(/\s+/g, '_').toLowerCase()}`,
          isLandmark: true,
          isCitySpecific: true
        });
      }
    });
  }

  // Combiner et limiter les résultats
  const combinedResults = [
    ...cityResults.slice(0, Math.ceil(limit / 2)),
    ...landmarkResults.slice(0, Math.floor(limit / 2))
  ];

  return combinedResults.slice(0, limit);
};