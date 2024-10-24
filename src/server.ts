import dotenv from "dotenv";
import app from "./index";
import db from "@/database/dbConnect";
import config from "config";
// Load environment variables from .env file
dotenv.config();

const PORT = Number(process.env.PORT) || 9999;
const HOSTNAME = config.SERVICE_HOST;

// Connect to the database
db.connect();

// Create server and listen on the port
app.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at: http://${HOSTNAME}:${PORT}`);
});
