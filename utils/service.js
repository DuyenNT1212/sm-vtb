var db = require("../db/index");
var moment = require("moment");
const tokenAction = require("../utils/token");
var decodeToken = require("jwt-decode");

async function getAllUser() {
  let pro = new Promise((resolve, reject) => {
    let sql =
      "select u.user_id, username, fullname, role_name, created_at \
              from `user` u \
              left join user_roles ur on u.user_id = ur.user_id \
              left join `role` r on r.role_id = ur.role_id order by created_at desc";
    db.query(sql, (err, data) => {
      if (err) throw err;
      for (let i = 0; i < data.length; i++) {
        data[i].created_at = moment(data[i].created_at).format(
          "DD/MM/YYYY HH:mm:ss"
        );
      }
      resolve(data);
    });
  });

  return (res = pro.then(
    (val) => {
      return val;
    },
    (reason) => {
      console.error(reason); // Error!
    }
  ));
}

async function getUserByUsername(username) {
  let pro = new Promise((resolve, reject) => {
    let sql =
      "select u.user_id, username, role_name, password from user u\
          left join user_roles ur on u.user_id = ur.user_id \
          left join `role` r on r.role_id = ur.role_id where username = ? ";
    db.query(sql, [username], (err, data) => {
      if (err) {
        console.log(err);
        throw err;
      }
      resolve(data);
    });
  });

  return (res = pro.then(
    (val) => {
      return val;
    },
    (reason) => {
      console.error(reason); // Error!
    }
  ));
}

async function getAllRoles() {
  let pro = new Promise((resolve, reject) => {
    let sql = "select * from role";
    db.query(sql, (err, data) => {
      if (err) throw err;
      resolve(data);
    });
  });

  return (res = pro.then(
    (val) => {
      return val;
    },
    (reason) => {
      console.error(reason); // Error!
    }
  ));
}

async function addRoleUser(userId, roleId) {
  let pro = new Promise((resolve, reject) => {
    let query = "insert into user_roles (user_id, role_id ) values (?, ?)";
    db.query(query, [userId, roleId], function (err, result) {
      if (err) throw err;
      resolve(result);
    });
  });

  return (res = pro.then(
    (val) => {
      return val.length != 0 ? true : false;
    },
    (reason) => {
      console.error(reason); // Error!
    }
  ));
}

async function saveLogDownload(linkDownload, username, clientIp, fileName) {
  let pro = new Promise((resolve, reject) => {
    let query =
      "INSERT into log_download (link_download, by_user , client_ip, file_name) values (?, ?, ?, ?)";
    db.query(
      query,
      [linkDownload, username, clientIp, fileName],
      function (err, result) {
        if (err) throw err;
        resolve(result);
      }
    );
  });

  return (res = pro.then(
    (val) => {
      return val.length != 0 ? true : false;
    },
    (reason) => {
      console.error(reason); // Error!
    }
  ));
}

function getAccountInfoFromToken(req) {
  const token = req.headers.cookie;
  var username = decodeToken(token).username;
  var role = decodeToken(token).role;
  return {
    username: username,
    role: role,
  };
}

async function getAllLog() {
  let pro = new Promise((resolve, reject) => {
    let sql = "select * from log_download order by time desc";
    db.query(sql, (err, data) => {
      if (err) throw err;
      listUser = data;
      for (let i = 0; i < data.length; i++) {
        data[i].time = moment(data[i].time).format("DD/MM/YYYY HH:mm:ss");
      }
      resolve(data);
    });
  });
  return (res = pro.then(
    (val) => {
      return val;
    },
    (reason) => {
      console.error(reason); // Error!
    }
  ));
}

async function getLogByUsername(username) {
  let pro = new Promise((resolve, reject) => {
    let sql = "select * from log_download where by_user = ? order by time desc";
    db.query(sql, [username], (err, data) => {
      if (err) throw err;
      listUser = data;
      for (let i = 0; i < data.length; i++) {
        data[i].time = moment(data[i].time).format("DD/MM/YYYY HH:mm:ss");
      }
      resolve(data);
    });
  });
  return (res = pro.then(
    (val) => {
      return val;
    },
    (reason) => {
      console.error(reason); // Error!
    }
  ));
}

async function getAllAccountCredential() {
  let pro = new Promise((resolve, reject) => {
    let sql = "select * from master_credentials order by created_at desc";
    db.query(sql, (err, data) => {
      if (err) throw err;
      listUser = data;
      for (let i = 0; i < data.length; i++) {
        data[i].created_at = moment(data[i].created_at).format(
          "DD/MM/YYYY HH:mm:ss"
        );
      }
      resolve(data);
    });
  });
  return (res = pro.then(
    (val) => {
      return val;
    },
    (reason) => {
      console.error(reason);
    }
  ));
}

async function addAccountCredential(email, password, byUser) {
  let pro = new Promise((resolve, reject) => {
    let sql =
      "insert into master_credentials (email, password, by_user) values (?, ?, ?)";
    db.query(sql, [email, password, byUser], (err, data) => {
      if (err) throw err;
      resolve(data);
    });
  });
  return (res = pro.then(
    (val) => {
      return val;
    },
    (reason) => {
      console.error(reason);
    }
  ));
}

async function getHistoryFingerprint() {
  let pro = new Promise((resolve, reject) => {
    let sql = "select * from fingerprint order by created_at desc";
    db.query(sql, (err, data) => {
      if (err) throw err;
      listUser = data;
      for (let i = 0; i < data.length; i++) {
        data[i].created_at = moment(data[i].created_at).format(
          "DD/MM/YYYY HH:mm:ss"
        );
      }
      resolve(data);
    });
  });
  return (res = pro.then(
    (val) => {
      return val;
    },
    (reason) => {
      console.error(reason);
    }
  ));
}

async function changeFingerprint(fingerprint, byUser) {
  let pro = new Promise((resolve, reject) => {
    let sql = "insert into fingerprint (value, by_user) values (?, ?)";
    db.query(sql, [fingerprint, byUser], (err, data) => {
      if (err) throw err;
      resolve(data);
    });
  });
  return (res = pro.then(
    (val) => {
      return val;
    },
    (reason) => {
      console.error(reason);
    }
  ));
}

async function addUser(username, fullname, hashPassword, salt, roleId) {
  let pro = new Promise((resolve, reject) => {
    let sqlAddUser =
      "insert into user(username, fullname, password, salt)\
                    values (?, ?, ?, ?)";
    db.query(
      sqlAddUser,
      [username, fullname, hashPassword, salt],
      (err, data) => {
        if (err) throw err;
        resolve(data);
      }
    );
  });

  let userAdd = await getUserByUsername(username);
  addRoleUser(userAdd[0].user_id, roleId);

  let listUser = getAllUser();

  return (res = pro.then(
    (val) => {
      return val.length != 0 ? listUser : null;
    },
    (reason) => {
      console.error(reason); // Error!
    }
  ));
}

async function deleteUser(userId) {
  let sqlDelUser = "delete from user where user_id = ?";
  let sqlDelRole = "delete from user_roles where user_id = ?"
  let sqlGetUser = "select u.user_id, username, role_name, password from user u\
                  left join user_roles ur on u.user_id = ur.user_id \
                  left join `role` r on r.role_id = ur.role_id";
  db.query(sqlDelRole, userId, (err, data) => {
    if (err) throw err;
  });
  db.query(sqlDelUser, userId, (err, data) => {
    if (err) throw err;
  });

  let pro = new Promise((resolve, reject) => {
    db.query(sqlGetUser, (err, data) => {
      if (err) throw err;
      resolve(data);
    });
  });
  return (res = pro.then(
    (val) => {
      return val;
    },
    (reason) => {
      console.error(reason);
    }
  ));
}

module.exports = {
  getAllUser,
  getUserByUsername,
  getAllRoles,
  addRoleUser,
  saveLogDownload,
  getAccountInfoFromToken,
  getAllLog,
  getLogByUsername,
  getAllAccountCredential,
  addAccountCredential,
  getHistoryFingerprint,
  changeFingerprint,
  addUser,
  deleteUser
};
