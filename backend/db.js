const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const dbMode = process.env.DB_MODE || "local";

    const mongoURI =
      dbMode === "cloud"
        ? process.env.MONGO_URI_CLOUD
        : process.env.MONGO_URI_LOCAL;

    console.log(`Connecting to ${dbMode.toUpperCase()} MongoDB...`);

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(" MongoDB connected successfully!");
  } catch (err) {
    console.error(" MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
