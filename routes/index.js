const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const moment = require("moment");
const service = require("../utils/service");
const { authUser, authRole } = require("../middleware/auth");
const {getAllSystem, getDetailBySystemId} = require("../utils/service");
const multer = require('multer');
const xlsx = require('xlsx');

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
    "/system/all",
    authUser,
    async function (req, res, next) {
        let info = service.getAccountInfoFromToken(req);
        let data = await service.getAllSystemFilter(req.query.sysName, req.query.ip, req.query.hostname);
        res.render("partials/table-sys-management", {
            error: "",
            loading: false,
            data: data,
            username: info.username,
        });
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
        let systemDb = await service.getSystemByName(req.body.name);

        if (systemDb.length !== 0) {
            return res.status(409).end();
        } else {
            await service.addSystem(req.body.name, info.username);
            let listSys = await service.getAllSystem(req.body.name, info.username);
            res.render("partials/table-sys-management", {
                error: "",
                loading: false,
                data: listSys,
                username: info.username,
            });
        }
    }
);

router.post(
    "/system/edit",
    authUser,
    async (req, res, next) => {
        let info = service.getAccountInfoFromToken(req);
        let ipHostnameDb = await service.getIpHostnameByIpHostname(req.body.systemId, req.body.ip, req.body.hostname);
        if (ipHostnameDb.length !== 0) {
            let data = await service.getDetailBySystemId(req.query.systemId);
            return res.status(409).render("partials/table-ip-hostname", {
                data: data
            });
        } else {
            let listSys = await service.editSystem(req.body.systemId, req.body.ip, req.body.hostname, req.body.note);
            console.log('data', listSys)
            res.render("partials/table-ip-hostname", {
                data: listSys,
            });
        }
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

router.post('/file-upload/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    console.log(req.file.originalname, req.file.buffer.toString('binary'), req.body.systemId)
    await service.deleteFileServer(req.body.systemId)
    await service.addFileSystem(req.body.systemId, req.file.originalname, req.file.buffer.toString('binary'))

    res.render("partials/upload-file-server", {
        fileName: req.file.originalname
    });
});

router.post('/file-upload/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    console.log(req.file.originalname, req.file.buffer.toString('binary'), req.body.systemId)
    await service.deleteFileServer(req.body.systemId)
    await service.addFileSystem(req.body.systemId, req.file.originalname, req.file.buffer.toString('binary'))

    res.render("partials/upload-file-server", {
        fileName: req.file.originalname
    });
});

async function insertIpHostname(sysId, ip, hostname, note) {
    let ipHostnameDb = await service.getIpHostnameByIpHostname(sysId, ip, hostname);
    console.log('ipHostnameDb', ipHostnameDb)
    if (ipHostnameDb.length === 0) {
        await service.editSystem(sysId, ip, hostname, note);
    }
}

router.get('/file-upload/download', async (req, res) => {
    const sysId = req.query.systemId;

    let ipHostnameDb = await service.getFileSystemBySysId(sysId);
    if (ipHostnameDb.length === 0) {
        return res.status(404).end();
    } else {
        return res.download(ipHostnameDb)
    }
});

module.exports = router;
