// Configuration SMS pour Zeurk
export const SMS_CONFIG = {
  // Numéro Twilio configuré
  TWILIO_NUMBER: '+18447904199',
  
  // Messages prédéfinis
  MESSAGES: {
    INSTRUCTION: `Envoyez un SMS au +18447904199 avec le format:

"Course [Départ] vers [Destination] [Heure]"

Exemples:
• "Course Bandal vers Gombe 18h"
• "Course 4b avenue Uvira ref grand hotel vers Stade"
• "Course Ma position vers Aéroport 15h30"

Voulez-vous ouvrir l'application SMS?`,
    
    ERROR: 'Impossible d\'ouvrir l\'application SMS'
  }
};

// Fonction utilitaire pour formater le SMS
export const formatSMSBody = (startLocation, destination, time = '') => {
  const start = startLocation || 'Ma position';
  const timeText = time ? ` ${time}` : '';
  return `Course ${start} vers ${destination}${timeText}`;
};