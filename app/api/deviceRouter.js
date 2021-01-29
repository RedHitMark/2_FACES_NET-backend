const express = require('express');
const deviceManager = require('../socket/deviceManager');


const deviceRouter = express.Router();


deviceRouter
    .get("/", (req, res) => {
        deviceManager.showAllDevices()
            .then((devices) => {
                res.json(devices);
            })
            .catch((error) => {
                console.log(error);
                res.status(500).json({error: error});
            });
    })
    .post("/", (req, res) => {
        const device = req.body.device;
        const payloadId = req.body.payload_id;
        const payloadArgs = req.body.payload_args;

        if (payloadId) {
            deviceManager.triggerDevice(device, payloadId, payloadArgs)
                .then((ok) => {
                    res.json(ok);
                }).catch((error) => {
                    res.status(error.status).json({error: error.message});
                });
        } else {
            res.status(401).json({error: "Missing payload_id body parameter"});
        }
    });


module.exports = deviceRouter;

