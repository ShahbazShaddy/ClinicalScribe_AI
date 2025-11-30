/**
 * Environment configuration
 * This file provides a centralized way to access environment variables
 */

export const ENV = {
  GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY || '',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

// Validation - throw error if critical env vars are missing
if (!ENV.GROQ_API_KEY && ENV.IS_DEV) {
  console.error('❌ VITE_GROQ_API_KEY is not set in your .env file');
  console.error('Please add this line to your .env file:');
  console.error('VITE_GROQ_API_KEY=your_api_key_here');
  console.error('\nThen restart your dev server with: npm run dev');
}

export default ENV;
