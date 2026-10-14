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
const { scheduleNightlyPaymentReport } = require('./util/nightlyPaymentReport');

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
    scheduleNightlyPaymentReport();

})

// Safety net: log (instead of crash silently) any unhandled async error or
// sync throw that escaped a try/catch. This makes future "server died for no
// reason" incidents diagnosable instead of mysterious.
process.on('unhandledRejection', (reason) => {
    logger.error('unhandledRejection: %s', reason && reason.stack ? reason.stack : reason);
});
process.on('uncaughtException', (err) => {
    logger.error('uncaughtException: %s', err && err.stack ? err.stack : err);
});
