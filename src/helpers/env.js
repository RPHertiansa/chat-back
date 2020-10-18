require('dotenv').config()

module.exports = {
    PORT        : process.env.PORT,
    DB_HOST     : process.env.DB_HOST,
    DB_USER     : process.env.DB_USER,
    DB_NAME     : process.env.DB_NAME,
    DB_PASS     : process.env.DB_PASS,
    JWT_KEY     : process.env.JWT_KEY,
    myemail     : process.env.MYEMAIL,
    mypassword  : process.env.MYPASSWORD,
    url         : process.env.URL,
    urlforgot   : process.env.URL_FORGOT
}