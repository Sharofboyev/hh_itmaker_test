const express = require("express");
const config = require("./config");
const multer = require("multer")
const fs = require("fs");
const AWS = require("aws-sdk")
const s3 = new AWS.S3({
    accessKeyId: config.access_key,
    secretAccessKey: config.secret_key,
    region: config.region
})
let upload = multer({ dest: 'uploads/' })

const app = express();
app.use(express.json());

app.post("/", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).send("You should provide a file in request body");
    try {
        if (config.valid_types.length > 1 || config.valid_types[0]){         //checking content types is done only when valid types are provided
            if (!config.valid_types.includes(req.file.mimetype)){
                fs.unlink(req.file.path);
                return res.status(400).send(`File content-type ${req.file.mimetype} is not supported`)
            }
        }
        let splitted = req.file.originalname.split(".")
        if (config.valid_extensions.length > 1 || config.valid_extensions[0]) {
            if (!config.valid_extensions.includes(splitted[splitted.length - 1])){
                fs.unlink(req.file.path);
                return res.status(400).send(`File extension .${splitted[splitted.length - 1]} is not supported`)
            }
        }
        if (config.max_size && req.file.size > config.max_size){
            fs.unlink(req.file.path);
            return res.status(400).send(`File entity too large. Supported maximumu size is ${config.max_size} bytes`)
        }
        let data = fs.createReadStream(req.file.path)
        const params = {
            Bucket: config.bucket_name,
            Key: req.file.originalname, 
            Body: data
        };
        s3.upload(params, (error, data) => {
            fs.unlink(req.file.path);  // delete file after uploading it
            if (error) {
                console.log(error.message)
                return res.status(503).send("External server error")
            }
            res.send(`File uploaded successfully`)
        });
     } catch (err) {
        console.log(err.message);
        return res.status(500).send("Internal server error")
     }
})


app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}...`)
})