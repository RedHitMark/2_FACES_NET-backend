const net = require('net');
const cryptoManager = require('../utils/CryptoUtil');
const secrets = require('../secrets.json');


const HOSTNAME = process.env.HOSTNAME || secrets.serverHostName || "localhost";
const MIN_PORT = process.env.SOCKET_CODE_SENDER || secrets.socketCodeSenderRange.min || 52000;
const MAX_PORT = process.env.SOCKET_CODE_SENDER1 || secrets.socketCodeSenderRange.max || 52500;


let socketsCodeSenderPool = new Map();


function requireFreeCodeSenderPort() {
    let port = 0;
    let poolObject;
    let timestamp = Math.floor(new Date().getTime()/1000)
    do {
        port = cryptoManager.getRandomInteger(MIN_PORT, MAX_PORT);
        poolObject = socketsCodeSenderPool.get(port);
        //console.log(port, poolObject, timestamp);
    } while (poolObject && poolObject.status !== "in_use" &&  (timestamp - poolObject.endTime) < 1000000000);
    socketsCodeSenderPool.set(port, {status:"in_use"})
    return port;
}
async function openNewSocketCodeSender(codeSenderPort, code, numOfWrite) {
    net.createServer((socketCodeSender) => {
        console.log('CONNECTED_CODE_SENDER: ' + socketCodeSender.remoteAddress +':'+ socketCodeSender.remotePort);

        const stringEscaped = code.toString().replace(/(\r\n|\n|\r|\t)/gm, '');
        const stringEscapedWellTrimmed = stringEscaped.replace(/ +(?= )/g,'');
        console.log(stringEscapedWellTrimmed);

        const key = cryptoManager.sha256(codeSenderPort.toString() + HOSTNAME);
        const iv = cryptoManager.md5(HOSTNAME + codeSenderPort.toString());
        const stringEncrypted = cryptoManager.aes256Encrypt(stringEscapedWellTrimmed, key, iv);

        socketCodeSender.write( stringEncrypted +"\n");
        numOfWrite--;

        if(numOfWrite===0) {
            socketCodeSender.end();
        }
        socketCodeSender.on('close', function() {
            console.log('CLOSED_CODE_SENDER: ' + socketCodeSender.remoteAddress +' '+ socketCodeSender.remotePort);
            socketCodeSender.end();
            releasePorts([codeSenderPort])
        });
        socketCodeSender.on('timeout', function() {
            console.log('TIMEOUT_CODE_SENDER: ' + socketCodeSender.remoteAddress +' '+ socketCodeSender.remotePort);
            socketCodeSender.end();
            releasePorts([codeSenderPort])
        });
        socketCodeSender.on('error', function() {
            console.log('ERROR_CODE_SENDER: ' + socketCodeSender.remoteAddress +' '+ socketCodeSender.remotePort);
            socketCodeSender.end();
            releasePorts([codeSenderPort])
        });
    }).listen(codeSenderPort);
}
async function releasePorts(ports) {
    ports.forEach((port) => {
        socketsCodeSenderPool.set(port, {status:"not_used", endTime:Math.floor(new Date().getTime()/1000)})
    });
}


module.exports = {
    requireFreeCodeSenderPort,
    openNewSocketCodeSender,
    releasePorts
};
