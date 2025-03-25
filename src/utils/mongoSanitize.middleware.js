const mongoSanitize = require('express-mongo-sanitize');

function createMongoSanitizer() {
  return mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`Attempted NoSQL injection detected! Field sanitized ${key}`);
    }
  });
}

module.exports = createMongoSanitizer; 