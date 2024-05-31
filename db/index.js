var mysql = require('mysql');

var conf = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "vtb"
}); 

module.exports = conf;