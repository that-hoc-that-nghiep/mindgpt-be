declare namespace NodeJS {
  export interface ProcessEnv {
    SERVICE_HOST: string;
    API_AUTH: string;
    API_MINGPT_BE: string;
    API_AI_HUB: string;
    MONGO_DB_URI: string;
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
  }
}
