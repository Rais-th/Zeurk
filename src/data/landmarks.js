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