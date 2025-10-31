import dotenv from "dotenv";
dotenv.config(); 
// export const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

// Default: read from .env
let baseURL = process.env.API_BASE_URL;

if (process.env.DOCKER_ENV === "false") {
  baseURL = "http://127.0.0.1:8000";
}

export const API_BASE_URL = baseURL;