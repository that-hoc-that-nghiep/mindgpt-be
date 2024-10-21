import path from "path";
import dotenv from "dotenv";

// Parsing the env file.
dotenv.config({ path: path.resolve(__dirname, "./.env") });

// Interface to load env variables
// Note these variables can possibly be undefined
// as someone could skip these varibales or not setup a .env file at all

interface ENV {
  API_MINGPT_BE: string | undefined;
  API_AI_HUB: string | undefined;
  MONGO_DB_URI: string | undefined;
  SUPABASE_URL: string | undefined;
  SUPABASE_KEY: string | undefined;
}

interface Config {
  API_MINGPT_BE: string;
  API_AI_HUB: string;
  MONGO_DB_URI: string;
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
}

// Loading process.env as ENV interface

const getConfig = (): ENV => {
  return {
    API_MINGPT_BE: process.env.API_MINGPT_BE,
    API_AI_HUB: process.env.API_AI_HUB,
    MONGO_DB_URI: process.env.MONGO_DB_URI,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
  };
};

// Throwing an Error if any field was undefined we don't
// want our app to run if it can't connect to DB and ensure
// that these fields are accessible. If all is good return
// it as Config which just removes the undefined from our type
// definition.

const getSanitzedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in config.env`);
    }
  }
  return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;
