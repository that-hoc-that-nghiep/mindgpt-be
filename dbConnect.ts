import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connectString: string = process.env.MONGODB_URI || "";

// Lấy tên database từ chuỗi kết nối
const dbName: string = connectString.split("/").pop()?.split("?")[0] || "";

class Database {
  private static instance: Database;

  private constructor() {
    this.connect();
  }

  private connect(type = "mongodb"): void {
    mongoose
      .connect(connectString, { maxPoolSize: 50 })
      .then(() => {
        console.log("Connected Mongodb Success");
        console.log(`Connected to MongoDB Database: ${dbName}`);
      })
      .catch((err) => {
        console.log("Error Connect: ", err);
      });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceMongoDb = Database.getInstance();

export default instanceMongoDb;
