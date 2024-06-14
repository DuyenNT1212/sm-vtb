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
      "select * from SM_USER where username = ? ";
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

async function getSystemByName(username) {
  let pro = new Promise((resolve, reject) => {
    let sql =
        "select * from SM_SYSTEM where NAME = ? ";
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

async function getIpHostnameByIpHostname(sysId, ip, hostname) {
  let pro = new Promise((resolve, reject) => {
    let sql =
        "select * from SM_IP_HOSTNAME where SYSTEM_ID = ? and IP = ? and HOSTNAME = ?";
    db.query(sql, [sysId, ip, hostname], (err, data) => {
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

async function getAllSystem() {
  let pro = new Promise((resolve, reject) => {
    let sql = "select * from sm_system order by created_time desc";
    db.query(sql, (err, data) => {
      if (err) throw err;
      for (let i = 0; i < data.length; i++) {
        data[i].created_time = moment(data[i].created_time).format("DD/MM/YYYY HH:mm:ss");
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

async function getAllSystemFilter(sysName, ip, hostname) {

  let pro = new Promise((resolve, reject) => {
    let sql = "select distinct T1.* from sm_system T1\n" +
        "right join sm_ip_hostname T2 on T1.id = T2.system_id\n" +
        "where case when T1.name != '' then T1.name like ? else true end\n" +
        "and case when T2.IP != '' then T2.IP like ? else true end\n" +
        "and case when T2.hostname != '' then T2.hostname like ? else true end\n" +
        "order by T1.created_time desc";
    db.query(sql, [`%${sysName}%`, `%${ip}%`, `%${hostname}%`], (err, data) => {
      if (err) throw err;
      for (let i = 0; i < data.length; i++) {
        data[i].created_time = moment(data[i].created_time).format("DD/MM/YYYY HH:mm:ss");
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

async function getDetailBySystemId(systemId) {
  let pro = new Promise((resolve, reject) => {
    let sql = "select * from sm_ip_hostname where system_id = ? order by created_time desc";
    db.query(sql, [systemId], (err, data) => {
      if (err) throw err;
      for (let i = 0; i < data.length; i++) {
        data[i].created_time = moment(data[i].created_time).format("DD/MM/YYYY HH:mm:ss");
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

async function addSystem(name, username) {
  let pro = new Promise((resolve, reject) => {
    let sql = "insert into sm_system(name, username) values (?, ?)";
    db.query(
      sql,
      [name, username],
      (err, data) => {
        if (err) throw err;
        resolve(data);
      }
    );
  });

  let listUser = getSystemByName(name);

  return (res = pro.then(
    (val) => {
      return val.length != 0 ? listUser : null;
    },
    (reason) => {
      console.error(reason); // Error!
    }
  ));
}

async function addFileSystem(sysId, fileName, content) {
  let pro = new Promise((resolve, reject) => {
    let sql = "insert into SM_SERVER_FILE(system_id, file_name, content) values (?, ?, ?)";
    db.query(
        sql,
        [sysId, fileName, content],
        (err, data) => {
          if (err) throw err;
          resolve(data);
        }
    );
  });

  let listUser = getFileSystemBySysId(sysId);

  return (res = pro.then(
      (val) => {
        return val.length != 0 ? listUser : null;
      },
      (reason) => {
        console.error(reason); // Error!
      }
  ));
}

async function getFileSystemBySysId(sysId) {
  let pro = new Promise((resolve, reject) => {
    let sql =
        "select * from SM_SERVER_FILE where SYSTEM_ID = ? ";
    db.query(sql, [sysId], (err, data) => {
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

async function editSystem(systemId, ip, hostname, note) {
  let pro = new Promise((resolve, reject) => {
    let sql = "insert into sm_ip_hostname(system_id, ip, hostname, note) values (?, ?, ?, ?)";
    db.query(
        sql,
        [systemId, ip, hostname, note],
        (err, data) => {
          if (err) throw err;
          resolve(data);
        }
    );
  });

  let listUser = await getDetailBySystemId(systemId);

  return (res = pro.then(
      (val) => {
        return val.length != 0 ? listUser : null;
      },
      (reason) => {
        console.error(reason); // Error!
      }
  ));
}

async function deleteSys(sysId) {
  let sqlDelSys = "delete from sm_system where id = ?";
  let sqlDelSysIpHost = "delete from sm_ip_hostname where system_id = ?"
  let sqlDelSysFile = "delete from sm_server_file where system_id = ?"
  let sqlGetUser = "select * from sm_system";
  db.query(sqlDelSysIpHost, sysId, (err, data) => {
    if (err) throw err;
  });
  db.query(sqlDelSysFile, sysId, (err, data) => {
    if (err) throw err;
  });
  db.query(sqlDelSys, sysId, (err, data) => {
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

async function deleteIpHostname(id) {
  let pro = new Promise((resolve, reject) => {
    let sqlDelSysIpHost = "delete from sm_ip_hostname where id = ?"
    db.query(sqlDelSysIpHost, [id], (err, data) => {
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

async function deleteFileServer(id) {
  let pro = new Promise((resolve, reject) => {
    let sqlDelSysIpHost = "delete from SM_SERVER_FILE where system_id = ?"
    db.query(sqlDelSysIpHost, [id], (err, data) => {
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

module.exports = {
  getUserByUsername,
  getAccountInfoFromToken,
  getAllSystem,
  addSystem,
  deleteSys,
  editSystem,
  getDetailBySystemId,
  deleteIpHostname,
  getSystemByName,
  getIpHostnameByIpHostname,
  getAllSystemFilter,
  deleteFileServer,
  addFileSystem,
  getFileSystemBySysId
};
