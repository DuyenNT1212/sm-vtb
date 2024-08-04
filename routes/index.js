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
const bcrypt = require("bcryptjs");
const storage = multer.memoryStorage();
const upload = multer({ dest: __dirname + '/uploads/' });

app.use(bodyParser.urlencoded({ extended: false }));

app.use("files", express.static(__dirname + "files"));

/* GET home page. */
router.get("/", authUser, async function (req, res, next) {
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
        let ipProd = ipProdList.map(i => i.IP).join(', \n');
        let ipPpeList = listIp.filter(item => item.type === 'PPE/UAT');
        let ipPpe = ipPpeList.map(i => i.IP).join(', \n');
        data[i].ipProdShort = ipProd?.split(',')[0];
        data[i].ipProd = ipProd;
        data[i].ipPpeShort = ipPpe?.split(',')[0];
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

        res.json(data);
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
            await service.addSystem(req.body.name, req.body.code, req.body.description, req.body.username);
            let listSys = await service.getAllSystem(req.body.name);
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
            let username = jsonData[i].Username;
            console.log(description, username)
            await insertServerIp(serverCode, serverName, type, ip, hostname, description, username);
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
        await addSystem(serverName, serverCode, description, username);
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

    console.log('req.file', req.file)

    fs.readFile(req.file.path, async (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading file.');
        }

        // Convert the file data to a base64 string
        const base64Data = data.toString('binary');

        await service.deleteFileServer(req.body.systemId)
        await service.addFileSystem(req.body.systemId, req.file.originalname, base64Data)
    });

    fs.unlinkSync(req.file.path);

    res.render("partials/upload-file-server", {
        fileName: req.file.originalname,
        sysId: req.body.systemId
    });
});

router.get('/file-upload', async (req, res) => {
    let sysId = req.query.systemId

    let fileInfo = await service.getFileSystemBySysId(sysId);

    if (fileInfo.length === 0) {
        res.status(200).end();
    } else {
        res.render("partials/upload-file-server", {
            fileName: fileInfo[0].file_name,
            sysId: sysId
        });
    }
});

async function insertIpHostname(sysId, ip, hostname, note, type) {
    let ipHostnameDb = await service.getIpHostnameByIpHostname(sysId, ip, hostname);
    if (ipHostnameDb.length === 0) {
        await service.editSystem(sysId, ip, hostname, note, type);
    }
}

router.get('/file-upload/download', async (req, res) => {
    const sysId = req.query.systemId;

    let fileInfo = await service.getFileSystemBySysId(sysId);
    if (fileInfo.length === 0) {
        return res.status(404).end();
    } else {
        const fileName = fileInfo[0].file_name;
        const content = fileInfo[0].content;
        const type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const outputFilePath = path.join(__dirname + '/uploads', fileName);

        res.setHeader('Content-Type', type);

        fs.writeFile(outputFilePath, content, { encoding: 'binary' }, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            console.log(`File saved to ${outputFilePath}`);
        });

        // console.log(typeof content, fileInfo[0], Buffer.from(content))

        // Send the file data as the response
        res.end(Buffer.from(content,'binary').toString('utf8'));
    }
});

router.post('/file-upload/delete', async (req, res) => {
    const sysId = req.body.systemId;

    await service.deleteFileServer(sysId);

    return res.status(200).end();

});

router.get("/logout", authUser, async (req, res, next) => {
    res.clearCookie("token");
    res.redirect("/login");
});

router.post(
    "/add-user",
    async (request, response) => {
        let body = request.body;
        if (!body.username || !body.fullname || !body.password) {
            return response.status(400).end();
        }
        let checkUsernameExist = await service.checkUsernameExistFunc(body.username);

        if (checkUsernameExist) return response.status(409).send("User is exist");

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(body.password, salt);

        await service.addUser(body.username, body.fullname, hashPassword, salt)

        response.status(200);
    }
);


module.exports = router;
