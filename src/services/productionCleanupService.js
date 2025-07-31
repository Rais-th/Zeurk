// Service de nettoyage automatique des données de test
// Ce service s'exécute au démarrage de l'app en mode production

import { getConfig, isRealDriver, devLog } from '../config/productionConfig';
import { firestore } from '../config/firebase';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';

class ProductionCleanupService {
  constructor() {
    this.config = getConfig();
    this.hasRunCleanup = false;
  }

  // Nettoyer automatiquement les données de test au démarrage
  async autoCleanupOnStartup() {
    if (!this.config.IS_PRODUCTION || !this.config.DATA_MANAGEMENT.AUTO_CLEANUP_TEST_DATA) {
      devLog('🧹 Nettoyage automatique désactivé (mode développement ou configuration)');
      return;
    }

    if (this.hasRunCleanup) {
      devLog('🧹 Nettoyage déjà effectué dans cette session');
      return;
    }

    try {
      devLog('🧹 Démarrage du nettoyage automatique des données de test...');
      
      const cleanupResults = await this.cleanupTestData();
      
      if (cleanupResults.driversRemoved > 0) {
        devLog(`✅ Nettoyage terminé: ${cleanupResults.driversRemoved} chauffeurs de test supprimés`);
      } else {
        devLog('✅ Aucune donnée de test trouvée à nettoyer');
      }
      
      this.hasRunCleanup = true;
      
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage automatique:', error);
    }
  }

  // Nettoyer les données de test
  async cleanupTestData() {
    const results = {
      driversRemoved: 0,
      errors: []
    };

    try {
      // Récupérer tous les chauffeurs
      const driversRef = collection(firestore, 'drivers');
      const driversSnapshot = await getDocs(driversRef);
      
      const testDrivers = [];
      
      driversSnapshot.forEach((doc) => {
        const driverId = doc.id;
        const driverData = doc.data();
        
        // Vérifier si c'est un chauffeur de test
        if (!isRealDriver(driverId)) {
          testDrivers.push({ id: driverId, data: driverData });
        }
      });

      devLog(`🔍 Trouvé ${testDrivers.length} chauffeurs de test à supprimer`);

      // Supprimer les chauffeurs de test
      for (const testDriver of testDrivers) {
        try {
          await deleteDoc(doc(firestore, 'drivers', testDriver.id));
          results.driversRemoved++;
          devLog(`🗑️ Supprimé chauffeur de test: ${testDriver.id}`);
        } catch (error) {
          console.error(`❌ Erreur suppression chauffeur ${testDriver.id}:`, error);
          results.errors.push({ id: testDriver.id, error: error.message });
        }
      }

    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des chauffeurs:', error);
      results.errors.push({ operation: 'cleanup_drivers', error: error.message });
    }

    return results;
  }

  // Valider les données de production
  async validateProductionData() {
    try {
      devLog('🔍 Validation des données de production...');
      
      const driversRef = collection(firestore, 'drivers');
      const driversSnapshot = await getDocs(driversRef);
      
      const realDrivers = [];
      const testDrivers = [];
      
      driversSnapshot.forEach((doc) => {
        const driverId = doc.id;
        const driverData = doc.data();
        
        if (isRealDriver(driverId)) {
          realDrivers.push({ id: driverId, data: driverData });
        } else {
          testDrivers.push({ id: driverId, data: driverData });
        }
      });

      const validation = {
        totalDrivers: driversSnapshot.size,
        realDrivers: realDrivers.length,
        testDrivers: testDrivers.length,
        isProductionReady: testDrivers.length === 0 && realDrivers.length > 0
      };

      devLog('📊 Validation des données:', validation);
      
      return validation;
      
    } catch (error) {
      console.error('❌ Erreur lors de la validation:', error);
      return null;
    }
  }

  // Obtenir le statut de production
  async getProductionStatus() {
    const validation = await this.validateProductionData();
    
    if (!validation) {
      return {
        isReady: false,
        message: "Erreur lors de la vérification des données"
      };
    }

    if (!validation.isProductionReady) {
      if (validation.realDrivers === 0) {
        return {
          isReady: false,
          message: "Aucun chauffeur réel trouvé. Ajoutez des chauffeurs via l'app."
        };
      }
      
      if (validation.testDrivers > 0) {
        return {
          isReady: false,
          message: `${validation.testDrivers} chauffeurs de test détectés. Nettoyage requis.`
        };
      }
    }

    return {
      isReady: true,
      message: `Production prête: ${validation.realDrivers} chauffeurs réels disponibles`
    };
  }

  // Forcer le nettoyage manuel
  async forceCleanup() {
    this.hasRunCleanup = false;
    return await this.cleanupTestData();
  }
}

// Instance singleton
const productionCleanupService = new ProductionCleanupService();

export default productionCleanupService;