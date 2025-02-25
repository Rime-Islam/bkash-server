import dotenv from "dotenv";
dotenv.config();


export default {
    port: process.env.PORT,
    db_url: process.env.DB_URL,
    salt_round: process.env.BCRYPT_SALT_ROUND,
    jwt_access_token: process.env.ACCESS_TOKEN_SECRET,
    URL: process.env.FRONTEND_URL,
    user_name: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
};