var express = require("express");
var router = express.Router();
var service = require("../utils/service");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const JWT_SECRET = "!30Nov2010_Clover!"

router.get("/login", function (req, res, next) {
  res.render("login");
});


router.post("/login", async (req, res) => {
  let body = req.body;
  console.log("bod", body);
  let user = await service.getUserByUsername(body.username);
  if (!user || user.length === 0) {
    res.status(400).send("Username or password is wrong");
  } else {
    const checkPassword = true;

    if (!checkPassword) {
      res.status(400).send("Username or password is wrong");
    } else {
      const token = jwt.sign(
        { username: body.username, role: user[0].role_name },
        JWT_SECRET,
        {
          expiresIn: 60 * 60 * 10,
        }
      );
      var response = {
        token: token,
      };

      console.log("Response: " + JSON.stringify(response));

      res.cookie("token", response["token"], {
        maxAge: 900000,
        httpOnly: true,
      });
      res.status(200).send(response);
    }
  }
});

module.exports = router;
