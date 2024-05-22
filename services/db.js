const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://arzAdmin:ZiVjDtoZmd7GL9Wq@arz.0gim6se.mongodb.net/'; // MongoDB connection URI
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db('UserReferral'); // Replace 'your_database_name' with your actual database name
    await ensureCollections(db);
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

async function ensureCollections(db) {
  // Ensure necessary collections exist
  await createCollectionIfNotExists(db, 'contractorModel');
  await createCollectionIfNotExists(db, 'rewardaddModel');
  // Add more collections if needed
}

async function createCollectionIfNotExists(db, collectionName) {
  const collections = await db.listCollections({ name: collectionName }).toArray();
  if (collections.length === 0) {
    await db.createCollection(collectionName);
    console.log(`Collection '${collectionName}' created`);
  }
}

module.exports = { connectDB };

