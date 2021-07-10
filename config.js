require("dotenv").config();

module.exports = {
    bucket_name: process.env.AWS_BUCKET_NAME,
    region: process.env.AWS_BUCKET_REGION,
    access_key: process.env.AWS_KEY,
    secret_key: process.env.AWS_SECRET_KEY,
    max_size: process.env.API_MAX_SIZE,
    port: process.env.API_PORT
}