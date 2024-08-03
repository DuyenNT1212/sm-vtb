const e = require('express');
const jwt = require('jsonwebtoken');
const tokenAction = require('../utils/token');
const service = require('../utils/service')
const JWT_SECRET = require('../credentials').JWT_SECRET;

async function authUser(req, res, next) {
    try {
        const token = req.cookies['token'] || ''; // prevent null
        const decodedToken = jwt.verify(token, JWT_SECRET);

        const username = decodedToken.username;
        let user = await service.getUserByUsername(username);
        const expiredTime = decodedToken.exp;

        if (user.length > 0 && expiredTime * 1000 > Date.now()) {
            next();
        } else {
            res.redirect('/login');
        }
    } catch {
        res.redirect('/login');
    }
}

module.exports = {
    authUser,
}
