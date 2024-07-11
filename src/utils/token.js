var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');

const TOKEN_ITEM = 'token';

function getToken() {
  return localStorage.getItem(TOKEN_ITEM);
};


function setToken(token) {
  localStorage.setItem(TOKEN_ITEM, token);
};

async function revokeToken() {
  localStorage.removeItem(TOKEN_ITEM);
};
module.exports = {
    getToken, setToken, revokeToken
}
