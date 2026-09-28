import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not defined.");
}

await mongoose.connect(uri);

const db = mongoose.connection.db;

if (!db) {
  throw new Error("Database connection is not available.");
}

const result = await db.collection("users").updateOne(
  { email: "bblkumar8@gmail.com" },
  {
    $set: {
      role: "admin",
    },
  }
);

console.log("Matched users:", result.matchedCount);
console.log("Modified users:", result.modifiedCount);

await mongoose.disconnect();