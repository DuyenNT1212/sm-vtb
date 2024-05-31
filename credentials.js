/**
 * Rename this file to credentials.js and change to actual username and password!
 * The file 'credentials.js' is ignored to prevent credential leak.
 */

// TODO: move secret to database so that we can update it automatically
const secret = {
  username: "***********",
  password: "*****",
};

const JWT_SECRET = "!30Nov2010_Clover!"

module.exports = {
  secret,
  JWT_SECRET
}