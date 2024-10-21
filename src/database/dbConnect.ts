import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connectString: string =
  process.env.MONGO_DB_URI || "mongodb://localhost:27017/";

// Lấy tên database từ chuỗi kết nối
const dbName: string = connectString.split("/").pop()?.split("?")[0] || "";

class Database {
  private static instance: Database;
  private static isConnected: boolean = false;

  connect(type = "mongodb"): void {
    if (Database.isConnected) {
      console.log("Already connected to the database.");
      return;
    }

    mongoose
      .connect(connectString, { maxPoolSize: 50 })
      .then(() => {
        Database.isConnected = true;
        // console.log("Connected Mongodb Success");
        console.log(`Connected to MongoDB Database: ${dbName}`);
      })
      .catch((err) => {
        console.log("Error Connect: ", err);
      });
  }

  public static getInstance(): Database {
    console;
    if (!Database.instance) {
      //console.log("Creating new Database instance");
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceMongoDb = Database.getInstance();

export default instanceMongoDb;
