var express = require("express");
var cors = require("cors");
var app = express();
var bodyparser = require("body-parser");
var https = require("https")
var http = require('http')
const fs = require('fs');
require('dotenv').config({ encoding: 'latin1' })
var morgan = require('morgan');
var logger = require('./util/logger');

if (process.env.NODE_ENV == "production") {
    // Hardcoded SSL certificate paths
    const privateKey = fs.readFileSync('/etc/ssl/private.key', 'utf8').toString();
    const certificate = fs.readFileSync('/etc/ssl/certificate.crt', 'utf8').toString();
    const ca = fs.readFileSync('/etc/ssl/ca_bundle.crt', 'utf8').toString();

    const options = { key: privateKey, cert: certificate, ca: ca };
    server = https.createServer(options, app);
    logger.info("Running in production with HTTPS");
} else {
    server = http.createServer(app);
    logger.info("Running in development with HTTP");
} 

app.use(
    bodyparser.urlencoded({
        extended: false,
    })
);

app.use(bodyparser.json());
app.use(cors());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.static('./', {
    maxAge: '1d' // Cache images for one day
}));

var mainRoute = require("./router");

app.use("/easygo", mainRoute);

server.listen(7006, () => {
    logger.info("server running on port 7006");

})
