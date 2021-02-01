const express = require('express');
const botnetManager = require('../socket/deviceManager');

const botnetRouter = express.Router();

botnetRouter
    .get("/", (req, res) => {
    })

module.exports = botnetRouter;