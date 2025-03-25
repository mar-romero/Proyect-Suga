

const mongoose = require('mongoose');

function setupMongoDBMonitoring(logger) {
  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err}`);
  });

  mongoose.set('debug', (collectionName, method, query, doc) => {
    const startTime = Date.now();
    const originalCallback = doc.callback;
    
    doc.callback = function(err, result) {
      const duration = Date.now() - startTime;
      
      if (duration > 100) {
        logger.warn({
          message: 'Slow MongoDB query detected',
          collection: collectionName,
          operation: method,
          query: JSON.stringify(query),
          duration: `${duration}ms`
        });
      }
      
      if (originalCallback) {
        originalCallback(err, result);
      }
    };
  });
  
  async function checkCollectionStats() {
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      
      for (const collection of collections) {
        const stats = await db.collection(collection.name).stats();
        
        if (stats.size > 1000000000) {
          logger.warn({
            message: 'Large collection detected',
            collection: collection.name,
            size: `${Math.round(stats.size / 1024 / 1024)}MB`,
            documentCount: stats.count
          });
        }
      }
    } catch (error) {
      logger.error(`Error checking collection stats: ${error.message}`);
    }
  }
  
  setInterval(checkCollectionStats, 24 * 60 * 60 * 1000);
  
  logger.info('MongoDB monitoring setup completed');
}

module.exports = { setupMongoDBMonitoring };