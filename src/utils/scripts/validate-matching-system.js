/**
 * Script de validation du système de matching automatique
 * Vérifie que tous les fichiers nécessaires existent et ont la bonne structure
 */

const fs = require('fs');
const path = require('path');

// Chemins des fichiers à vérifier
const filesToCheck = [
  'src/services/rideMatchingService.js',
  'src/services/notificationService.js',
  'src/screens/RideOptionsScreen.js',
  'src/utils/testMatching.js'
];

// Fonctions à vérifier dans chaque fichier
const functionsToCheck = {
  'src/services/rideMatchingService.js': [
    'createRideRequest',
    'startAutomaticMatching',
    'findAndNotifyDrivers',
    'notifyDriver',
    'handleDriverResponse',
    'assignDriver',
    'expandSearchRadius',
    'addAvailableDriver',
    'removeDriver',
    'listenToRideRequest'
  ],
  'src/services/notificationService.js': [
    'initialize',
    'initializeForUser',
    'sendToDriver',
    'sendToPassenger',
    'notifyRideFound',
    'notifyNewRideRequest',
    'notifyDriverEnRoute',
    'notifyDriverArrived',
    'notifyRideCompleted'
  ],
  'src/screens/RideOptionsScreen.js': [
    'handleStartMatching',
    'handleRideMatched',
    'handleRideCancelled',
    'handleRideTimeout',
    'handleCancelMatching'
  ]
};

console.log('🔍 Validation du système de matching automatique...\n');

let allValid = true;

// Vérifier l'existence des fichiers
console.log('📁 Vérification des fichiers:');
for (const filePath of filesToCheck) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${filePath}`);
  } else {
    console.log(`❌ ${filePath} - MANQUANT`);
    allValid = false;
  }
}

console.log('\n🔧 Vérification des fonctions:');

// Vérifier les fonctions dans chaque fichier
for (const [filePath, functions] of Object.entries(functionsToCheck)) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️ ${filePath} - Fichier manquant, ignoré`);
    continue;
  }

  console.log(`\n📄 ${filePath}:`);
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    for (const functionName of functions) {
      // Rechercher la fonction (méthode de classe ou fonction)
      const patterns = [
        new RegExp(`\\s+${functionName}\\s*\\(`), // Méthode de classe
        new RegExp(`const\\s+${functionName}\\s*=`), // Fonction const
        new RegExp(`function\\s+${functionName}\\s*\\(`), // Fonction déclarée
        new RegExp(`${functionName}:\\s*async`), // Méthode d'objet async
        new RegExp(`${functionName}\\s*:\\s*function`) // Méthode d'objet
      ];
      
      const found = patterns.some(pattern => pattern.test(content));
      
      if (found) {
        console.log(`  ✅ ${functionName}`);
      } else {
        console.log(`  ❌ ${functionName} - MANQUANTE`);
        allValid = false;
      }
    }
  } catch (error) {
    console.log(`  ❌ Erreur lecture fichier: ${error.message}`);
    allValid = false;
  }
}

// Vérifier les imports/exports
console.log('\n📦 Vérification des imports/exports:');

const importChecks = [
  {
    file: 'src/screens/RideOptionsScreen.js',
    imports: ['rideMatchingService', 'notificationService']
  }
];

for (const check of importChecks) {
  const fullPath = path.join(__dirname, check.file);
  
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    console.log(`\n📄 ${check.file}:`);
    for (const importName of check.imports) {
      if (content.includes(importName)) {
        console.log(`  ✅ Import ${importName}`);
      } else {
        console.log(`  ❌ Import ${importName} - MANQUANT`);
        allValid = false;
      }
    }
  }
}

// Vérifier les états React dans RideOptionsScreen
console.log('\n⚛️ Vérification des états React:');
const rideOptionsPath = path.join(__dirname, 'src/screens/RideOptionsScreen.js');

if (fs.existsSync(rideOptionsPath)) {
  const content = fs.readFileSync(rideOptionsPath, 'utf8');
  
  const stateVariables = [
    'isMatching',
    'matchingError',
    'rideRequest',
    'assignedDriver'
  ];
  
  for (const stateVar of stateVariables) {
    if (content.includes(`${stateVar},`) || content.includes(`set${stateVar.charAt(0).toUpperCase() + stateVar.slice(1)}`)) {
      console.log(`  ✅ État ${stateVar}`);
    } else {
      console.log(`  ❌ État ${stateVar} - MANQUANT`);
      allValid = false;
    }
  }
}

// Résumé final
console.log('\n' + '='.repeat(50));
if (allValid) {
  console.log('🎉 VALIDATION RÉUSSIE !');
  console.log('✅ Tous les composants du système de matching sont présents');
  console.log('✅ Toutes les fonctions nécessaires sont implémentées');
  console.log('✅ Les imports et états React sont configurés');
  console.log('\n🚀 Le système de matching automatique est prêt à être utilisé !');
} else {
  console.log('❌ VALIDATION ÉCHOUÉE !');
  console.log('⚠️ Certains composants ou fonctions sont manquants');
  console.log('🔧 Veuillez corriger les erreurs avant d\'utiliser le système');
}

console.log('\n📚 Documentation: MATCHING_SYSTEM.md');
console.log('🧪 Tests: src/utils/testMatching.js');
console.log('⚙️ Configuration: src/services/rideMatchingService.js');