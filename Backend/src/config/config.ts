import dotenv from 'dotenv';

dotenv.config();


const config = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    COHERE_API_KEY: process.env.COHERE_API_KEY || '',
    GROQ_API_KEY: process.env.GROQ_API_KEY || '',
    MONGODB_URI: process.env.MONGODB_URI || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
}


export default config;