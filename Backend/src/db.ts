const mongoose = require('mongoose');
const config = require('./config/config.ts');

async function connectDatabase() {
  const uri = config.MONGODB_URI;
  const dbName = config.MONGODB_DB_NAME;

  if (!uri) {
    throw new Error('MONGODB_URI must be defined in environment variables');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, dbName ? { dbName } : undefined);
  console.log('[db] Connected to MongoDB', dbName ? `db=${dbName}` : 'db=default');
}

module.exports = { connectDatabase };
