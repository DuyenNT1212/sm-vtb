let express = require("express");
let router = express.Router();
let service = require("../utils/service");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const JWT_SECRET = "!30Nov2010_Clover!"

router.get("/login", function (req, res, next) {
  res.render("login");
});


router.post("/login", async (req, res) => {
  let body = req.body;
  let user = await service.getUserByUsername(body.username);
  if (!user || user.length === 0) {
    res.status(400).send("Username or password is wrong");
  } else {
    const checkPassword = await bcrypt.compare(body.password, user[0].password);
    if (!checkPassword) {
      res.status(400).send("Username or password is wrong");
    } else {
      const token = jwt.sign(
        { username: body.username },
        JWT_SECRET,
        {
          expiresIn: 8 * 60 * 60,
        }
      );
      let response = {
        token: token,
      };

      res.cookie("token", response["token"], {
        maxAge: 90000000,
        httpOnly: true,
      });
      console.log(response)
      res.status(200).send(response);
    }
  }
});

module.exports = router;
