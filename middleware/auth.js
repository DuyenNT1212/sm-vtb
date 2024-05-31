const e = require('express');
const jwt = require('jsonwebtoken');
const tokenAction = require('../utils/token');
const JWT_SECRET = require('../credentials').JWT_SECRET;

function authUser(req, res, next) {
  try {
    const token = req.cookies['token'] || ''; // prevent null
    const decodedToken = jwt.verify(token, JWT_SECRET);
    // console.log('Decoded token: ' + JSON.stringify(decodedToken));

    const username = decodedToken.username;
    const expiredTime = decodedToken.exp;
    if (username || expiredTime * 1000 < Date.now()) {
      next();
    } else {
      res.redirect('/login');
    }
  } catch {
    res.redirect('/login');
  }
};

function authRole(role) {
    return (req, res, next) => {
        try {
            const token = req.cookies['token'] || '';
            const decodedToken = jwt.verify(token, JWT_SECRET);
            if (decodedToken.role === role) {
                next();
            } else {
                res.status(403).end();
            }
        } catch {
            res.status(403).end();
        }
    }
  };

module.exports = {
    authUser,
    authRole
}
