const net = require('net');
const cryptoManager = require('../utils/cryptoUtil');
const messageParser = require('../utils/messageParser');


const HOSTNAME = process.env.HOSTNAME || "localhost";
const MIN_PORT = process.env.SOCKET_COLLECTOR || 62000;
const MAX_PORT = process.env.SOCKET_COLLECTOR1 || 62500;


let socketsCollectorPool = new Map();


function requireFreeCodeCollectorPort() {
    let port = 0;
    let poolObject;
    let timestamp = Math.floor(new Date().getTime()/1000)
    do {
        port = cryptoManager.getRandomInteger(MIN_PORT, MAX_PORT);
        poolObject = socketsCollectorPool.get(port);
        console.log(port, poolObject, timestamp);
    } while (poolObject && poolObject.status !== "in_use" &&  (timestamp - poolObject.endTime) < 1000000000);
    socketsCollectorPool.set(port, {status:"in_use"})
    return port;
}
async function openSocketCollectorAndWaitForResult(collectorPort) {
    return new Promise((resolve,reject) => {
        net.createServer((socketCollector) => {
            console.log('CONNECTED_COLLECTOR: ' + socketCollector.remoteAddress +':'+ socketCollector.remotePort);

            let result = "";


            socketCollector.on('data', function(data) {
                result += data;
            });


            socketCollector.on('timeout', function(data) {
                console.log('TIMEOUT_COLLECTOR: ' + socketCollector.remoteAddress +' '+ socketCollector.remotePort);
                socketCollector.end();
                reject("socket timeout");
                releasePort(collectorPort);
            });
            socketCollector.on('error', function(data) {
                console.log('ERROR_COLLECTOR: ' + socketCollector.remoteAddress +' '+ socketCollector.remotePort);
                socketCollector.end();
                releasePort(collectorPort);
                reject("socket error");
            });
            socketCollector.on('close', function(data) {
                console.log('CLOSED_COLLECTOR: ' + socketCollector.remoteAddress +' '+ socketCollector.remotePort);
                socketCollector.end();
                releasePort(collectorPort);

                if (result && result !== "") {
                    const remotePort = socketCollector.remotePort;

                    const key = cryptoManager.sha256(collectorPort.toString() + HOSTNAME);
                    const iv = cryptoManager.md5(HOSTNAME + collectorPort.toString());
                    const message = cryptoManager.aes256Decrypt(result.toString(), key, iv);

                    console.log("Reading from SocketCollector"+collectorPort+":"+remotePort + " -> " +message);
                    resolve(message);
                } else {
                    reject("empty result");
                }
            });
        }).listen(collectorPort);
    });
}
async function releasePort(port) {
    socketsCollectorPool.set(port, {status:"not_used", endTime:Math.floor(new Date().getTime()/1000)});
}


module.exports = {
    requireFreeCodeCollectorPort,
    openSocketCollectorAndWaitForResult,
    releasePort
};
