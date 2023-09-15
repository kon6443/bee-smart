import * as dotenv from 'dotenv';
import * as path from 'path';

const envFilePath = path.resolve(__dirname, '../../config/.env');

// Load the .env file
dotenv.config({path: envFilePath});

export const config = {
    // MySQL DB connection
    MYSQL: {
        HOST: process.env.MYSQL_HOST,
        PORT: Number(process.env.MYSQL_PORT),
        USER: process.env.MYSQL_USER,
        PASSWORD: process.env.MYSQL_PASSWORD,
        DATABASE: process.env.MYSQL_DATABASE,
        ROOT_PASSWORD: process.env.MYSQL_ROOT_PASSWORD
    }

};

console.log(`process.env: ${process.env}`);
console.log(`config: ${config}`);
console.log(`process.env.MYSQL_HOST: ${process.env.MYSQL_HOST}`);
console.log(`HOST: ${config.MYSQL.HOST}`);
console.log(`USER: ${config.MYSQL.USER}`);

