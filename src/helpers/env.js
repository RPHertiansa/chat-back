require('dotenv').config()

module.exports = {
    PORT: process.env.PORT,
    DB_HOST     : process.env.DB_HOST,
    DB_USER     : process.env.DB_USER,
    DB_NAME     : process.env.DB_NAME,
    JWT_KEY     : process.env.JWT_KEY,
    myemail       : process.env.myemail,
    mypassword    : process.env.mypassword,
    URL         : process.env.URL
}