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

// Function to search landmarks by name or type
export const searchLandmarks = (query, limit = 5) => {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase();
  return kinshasaLandmarks
    .filter(landmark => 
      landmark.name.toLowerCase().includes(searchTerm) ||
      landmark.address.toLowerCase().includes(searchTerm) ||
      landmark.type.toLowerCase().includes(searchTerm)
    )
    .slice(0, limit)
    .map(landmark => ({
      ...landmark,
      description: `${landmark.name} • ${landmark.address}`,
      place_id: `landmark_${landmark.name.replace(/\s+/g, '_').toLowerCase()}`
    }));
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