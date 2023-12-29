import * as dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
export const UPLOADED_FILES_DESTINATION = process.env.UPLOADED_FILES_DESTINATION;
export const DB_HOST = process.env.DB_HOST;
export const DB_USERNAME = process.env.DB_USERNAME;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_DATABASE = process.env.DB_DATABASE;
export const DB_PORT = process.env.DB_PORT;

export const ADMIN_ROLE = 0;
export const STOCKER_ROLE = 1;
export const USER_SALESMAN_ROLE = 2;
export const USER_AREA_MANAGER_ROLE = 3;
export const AGENCY_ROLE = 4;