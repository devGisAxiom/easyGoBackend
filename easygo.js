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

// Nginx handles SSL termination; Node always runs plain HTTP
server = http.createServer(app);
logger.info("Running with HTTP (SSL handled by Nginx)"); 

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
