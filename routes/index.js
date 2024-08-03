const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const moment = require("moment");
const service = require("../utils/service");
const uploadFile = require("../utils/upload");
const { authUser, authRole } = require("../middleware/auth");
const {getAllSystem, getDetailBySystemId, getSystemByCode, addSystem} = require("../utils/service");
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ dest: __dirname + '/uploads/' });

app.use(bodyParser.urlencoded({ extended: false }));

app.use("files", express.static(__dirname + "files"));

/* GET home page. */
router.get("/", async function (req, res, next) {
    let info = service.getAccountInfoFromToken(req);
    let data = await service.getAllSystem();
    await mappingDetailIpSystem(data);
    res.render("index", {
        error: "",
        loading: false,
        data: data,
        username: info.username,
    });
});

async function mappingDetailIpSystem(data) {
    for (let i = 0; i < data.length; i ++) {
        let sysId = data[i].id;
        let listIp = await getDetailBySystemId(sysId);
        let ipProdList = listIp.filter(item => item.type === 'PROD');
        let ipProd = ipProdList.map(i => i.IP).join(',');
        let ipPpeList = listIp.filter(item => item.type === 'PPE/UAT');
        let ipPpe = ipPpeList.map(i => i.IP).join(',');
        data[i].ipProdShort = ipProd?.substring(0, 20);
        data[i].ipProd = ipProd;
        data[i].ipPpeShort = ipPpe?.substring(0, 20);
        data[i].ipPpe = ipPpe;
    }
}

router.get(
    "/system/all",
    authUser,
    async function (req, res, next) {
        let info = service.getAccountInfoFromToken(req);
        let data = await service.getAllSystemFilter(req.query.sysName, req.query.ip, req.query.hostname);
        await mappingDetailIpSystem(data);
        res.render("partials/table-sys-management", {
            error: "",
            loading: false,
            data: data,
            username: info.username,
        });
    }
);

router.get(
    "/system/download",
    authUser,
    async function (req, res, next) {
        let listSys = await service.getAllSystemDetail();

        let data = [];
        for (let i = 0; i < listSys.length; i++) {
            let d = {};
            d.STT = i + 1;
            d.Server_code = listSys[i].code;
            d.Server_name = listSys[i].name;
            d.Username = listSys[i].username;
            d.Type = listSys[i].type;
            d.IP = listSys[i].IP;
            d.Hostname = listSys[i].hostname;
            d.Description = listSys[i].description;

            data.push(d)
        }

        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(data);

        xlsx.utils.book_append_sheet(workbook, worksheet, 'Data');
        // const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        //
        // // Send the buffer to the client
        // res.setHeader('Content-Disposition', 'attachment; filename="data.xlsx"');
        // res.setHeader('Content-Type', 'application/octet-stream');
        // res.send(buffer);

        const filePath = path.join(__dirname, 'output.xlsx');

        xlsx.writeFile(workbook, filePath);

        // Send the file to the client
        res.download(filePath, 'data.xlsx', (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error downloading the file');
            } else {
                // fs.unlinkSync(filePath);
            }
        });
    }
);

router.get(
    "/detail",
    authUser,
    async function (req, res, next) {
        let info = service.getAccountInfoFromToken(req);
        let data = await service.getDetailBySystemId(req.query.systemId);
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
            await service.addSystem(req.body.name, req.body.code, req.body.description, info.username);
            let listSys = await service.getAllSystem(req.body.name, info.username);
            await mappingDetailIpSystem(listSys);
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
            let listSys = await service.editSystem(req.body.systemId, req.body.ip, req.body.hostname, req.body.note, req.body.type);
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
        await mappingDetailIpSystem(listSys);
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
        await service.deleteIpHostname(req.body.id);
        let listSys = await getDetailBySystemId(req.body.systemId);
        res.render("partials/table-ip-hostname", {
            data: listSys,
        });
    }
);

router.post('/upload', upload.single('file'), async (req, res) => {
    let info = service.getAccountInfoFromToken(req);
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    const filePath = req.file.path;
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);
        fs.unlinkSync(filePath);
        // console.log('jsonData', jsonData);
        for (let i = 1; i < jsonData.length; i++) {
            let serverCode = jsonData[i].Server_code;
            let serverName = jsonData[i].Server_name;
            let type = jsonData[i].Type;
            let ip = jsonData[i].IP;
            let hostname = jsonData[i].Hostname;
            let description = jsonData[i].Description;
            await insertServerIp(serverCode, serverName, type, ip, hostname, description, info.username);
        }
        let listSys = await service.getAllSystem(req.body.name, info.username);
        await mappingDetailIpSystem(listSys);
        res.render("partials/table-sys-management", {
            error: "",
            loading: false,
            data: listSys,
            username: info.username,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error processing file' });
    }
});

async function insertServerIp(serverCode, serverName, type, ip, hostname, description, username) {
    let server = await getSystemByCode(serverCode);
    if (server.length === 0) {
        await addSystem(serverName, serverCode, username);
        let serverAdded = await getSystemByCode(serverCode);
        await insertIpHostname(serverAdded[0].id, ip, hostname, description, type);
    } else {
        await insertIpHostname(server[0].id, ip, hostname, description, type)
    }
}
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

async function insertIpHostname(sysId, ip, hostname, note, type) {
    let ipHostnameDb = await service.getIpHostnameByIpHostname(sysId, ip, hostname);
    if (ipHostnameDb.length === 0) {
        await service.editSystem(sysId, ip, hostname, note, type);
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
