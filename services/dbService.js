// // This is a mockup. Replace with actual database logic.
// const dbService = {
//     createOneRecord: async (model, data) => {
//       // Implement actual database insertion logic here
//       return { id: 1, ...data }; // Mockup response
//     },
//     findAllRecords: async (model, where) => {
//       // Implement actual database query logic here
//       return []; // Mockup response
//     }
//   };
  
//   module.exports = dbService;


const { connectDB } = require('./db');

async function createOneRecord(collectionName, data) {
    const db = await connectDB();
    const collection = db.collection(collectionName);
    try {
      const result = await collection.insertOne(data);
      console.log(`Inserted ${result.insertedCount} record(s) into the collection`);
      return result;
    } catch (error) {
      console.error('Error inserting record:', error);
    }
  }
  
  async function findAllRecords(collectionName, query) {
    const db = await connectDB();
    const collection = db.collection(collectionName);
    try {
      return await collection.find(query).toArray();
    } catch (error) {
      console.error('Error finding records:', error);
    }
  }
  

module.exports = { createOneRecord, findAllRecords };




  
  