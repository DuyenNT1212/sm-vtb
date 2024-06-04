const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const moment = require("moment");
const service = require("../utils/service");
const { authUser, authRole } = require("../middleware/auth");
const {getAllSystem, getDetailBySystemId} = require("../utils/service");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use("files", express.static(__dirname + "files"));

/* GET home page. */
router.get("/", async function (req, res, next) {
    let info = service.getAccountInfoFromToken(req);
    let data = await service.getAllSystem();
    res.render("index", {
        error: "",
        loading: false,
        data: data,
        username: info.username,
    });
});

router.get(
    "/all",
    authUser,
    function (req, res, next) {
      let info = service.getAccountInfoFromToken(req);
      try {
        let sql =
            "select * from sm_system";
        db.query(sql, (err, data) => {
          for (let i = 0; i < data.length; i++) {
            data[i].created_time = moment(data[i].created_time).format("DD/MM/YYYY HH:mm:ss");
          }
          res.render("index", {
            data: data,
            role: info.role,
            username: info.username,
          });
        });
      } catch (err) {
        console.log("err login ", err);
      }
    }
);

router.get(
    "/detail",
    authUser,
    async function (req, res, next) {
        let info = service.getAccountInfoFromToken(req);
        let data = await service.getDetailBySystemId(req.query.systemId);
        console.log('data', data)
        res.render("partials/table-ip-hostname", {
            data: data,
        });
    }
);

router.post(
    "/system/add",
    authUser,
    async (req, res, next) => {
        let info = service.getAccountInfoFromToken(req);
        let listSys = await service.addSystem(req.body.name, info.username);
        res.render("partials/table-sys-management", {
            error: "",
            loading: false,
            data: listSys,
            username: info.username,
        });
    }
);

router.post(
    "/system/edit",
    authUser,
    async (req, res, next) => {
        let info = service.getAccountInfoFromToken(req);
        console.log('req.body', req.body)
        let listSys = await service.editSystem(req.body.systemId, req.body.ip, req.body.hostname, req.body.note);
        console.log('data', listSys)
        res.render("partials/table-ip-hostname", {
            data: listSys,
        });
    }
);

router.post(
    "/system/delete",
    authUser,
    async (req, res, next) => {
        await service.deleteSys(req.body.id);
        let listSys = await getAllSystem();
        let info = service.getAccountInfoFromToken(req);
        res.render("partials/table-sys-management", {
            error: "",
            loading: false,
            data: listSys,
            username: info.username,
        });
    }
);

router.post(
    "/ip-hostname/delete",
    authUser,
    async (req, res, next) => {
        console.log('req.body.id', req.body.id)
        await service.deleteIpHostname(req.body.id);
        let listSys = await getDetailBySystemId(req.body.systemId);
        console.log('data', listSys)
        res.render("partials/table-ip-hostname", {
            data: listSys,
        });
    }
);

module.exports = router;
