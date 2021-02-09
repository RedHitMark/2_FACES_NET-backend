const cryptoUtil = require('../utils/CryptoUtil');
const net = require('net');

class CryptedSocket {

    /**
     *
     * @param name
     * @param hostname
     * @param port
     * @param onConnection
     * @param onData
     * @param onError
     * @param onClose
     * @param onTimeout
     */
    constructor(name, hostname, port, onConnection, onData, onError, onClose, onTimeout) {
        this.name = name;
        this.hostname = hostname;
        this.port = port;

        this.server = net.createServer(socket => {
            onConnection(socket);

            socket.on('data', (encryptedBuffer) => {
                const message = this.getPlainMessage(encryptedBuffer)
                console.log(this.name + ' - READING: ' + this.port+":"+socket.remotePort + " <- " + message);

                onData(socket, message);
            });

            socket.on('error', () => {
                console.log(this.name + ' - ERROR: ' + socket.remoteAddress +' '+ socket.remotePort);
                onError(socket);
            });
            socket.on('timeout',  () => {
                console.log(this.name + ' - TIMEOUT: ' + socket.remoteAddress +' '+ socket.remotePort);
                onTimeout(socket);
            })
            socket.on('close', () => {
                console.log(this.name + ' - CLOSE: ' + socket.remoteAddress +' '+ socket.remotePort);
                onClose(socket);
            });
        }).listen(this.port, "0.0.0.0");
    }

    /**
     *
     * @param socket
     * @param message
     */
    write(socket, message) {
        console.log(this.name + ' - WRITING: ' + this.port+":"+socket.remotePort + " -> " + message);

        const key = cryptoUtil.sha256(this.port + this.hostname);
        const iv = cryptoUtil.md5(this.hostname + this.port);
        const messageEncrypted = cryptoUtil.aes256Encrypt(message, key, iv);

        socket.write( messageEncrypted +"\n");
    }

    /**
     *
     * @param encryptedBuffer
     * @returns {string}
     */
    getPlainMessage(encryptedBuffer) {
        const key = cryptoUtil.sha256(this.port + this.hostname);
        const iv = cryptoUtil.md5(this.hostname + this.port);

        return cryptoUtil.aes256Decrypt(encryptedBuffer.toString(), key, iv);
    }
}

module.exports = CryptedSocket;