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

app.post("/:filename", upload.single("file"), (req, res) => {
    try {
        let data = fs.createReadStream(req.file.path)
        const params = {
            Bucket: config.bucket_name,
            Key: req.file.originalname, 
            Body: data
        };
        s3.upload(params, (error, data) => {
            fs.unlinkSync(req.file.path);  // delete file after uploading it
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