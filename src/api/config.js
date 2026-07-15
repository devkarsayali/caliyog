// MongoDB Atlas Data API Configuration
// You'll get these from MongoDB Atlas > Data API
export const MONGODB_CONFIG = {
  API_KEY: import.meta.env.VITE_MONGODB_API_KEY,
  APP_ID: import.meta.env.VITE_MONGODB_APP_ID,
  BASE_URL: import.meta.env.VITE_MONGODB_API_URL, // https://data.mongodb-api.com/app/<APP_ID>/endpoint/data/v1
  DATA_SOURCE: 'Cluster0', // Your cluster name
  DATABASE: 'caliyog',
};

// Cloudinary config
export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  UPLOAD_URL: `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
};