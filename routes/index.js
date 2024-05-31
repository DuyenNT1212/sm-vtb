var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var moment = require("moment");
const api = require("../utils/service");
const { authUser, authRole } = require("../middleware/auth");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use("files", express.static(__dirname + "files"));

/* GET home page. */
router.get("/", function (req, res, next) {
  var info = api.getAccountInfoFromToken(req);
  res.render("index", {
    error: "",
    loading: false,
    role: info.role,
    username: info.username,
  });
});

module.exports = router;
