const CryptedSocket = require('./CryptedSocket');
const imageSearch = require("../utils/ImageSearch");
const messageParser = require("../utils/messageParser");

const HOSTNAME = process.env.HOSTNAME || "localhost";
const SOCKET_MAIN_PORT = process.env.SOCKET_MAIN_PORT || 6969;


let socketMain;
let activeSockets = new Map();


function openSocketMain() {
    socketMain = new CryptedSocket("SocketMain", HOSTNAME, SOCKET_MAIN_PORT,
        async function onConnect(socket) {
            activeSockets.set(socket.remotePort, {socket : socket});
        },
        async function onData(socket, message) {
            let activeSocket = activeSockets.get(socket.remotePort);


            if (message === "alive") {
                socketMain.write(socket, "Permissions");
            } else if (message.startsWith('Permissions:')) {
                activeSocket.permissions = messageParser.parsePermissions(message);

                socketMain.write(socket, "Permissions granted");
            } else if (message.startsWith('Permissions Granted:')) {
                activeSocket.permissionsGranted = messageParser.parseGrantedPermissions(message);

                socketMain.write(socket, "API");
            } else if (message.startsWith('API:')) {
                activeSocket.api = messageParser.parseApi(message);

                socketMain.write(socket, "Model");
            } else if (message.startsWith('Model:')) {
                activeSocket.model = messageParser.parseModel(message);
                activeSocket.modelImage = await imageSearch.getImageByPhoneName(activeSocket.model)
            }


            activeSockets.set(socket.remotePort, activeSocket);
        },
        function onError(socket) {
            activeSockets.delete(socket.remotePort);
            socket.end();
        },
        function onClose(socket) {
            activeSockets.delete(socket.remotePort);
            socket.end();
        },
        function onTimeout(socket) {
            activeSockets.delete(socket.remotePort);
            socket.end();
        });
}

function getSocketsMap() {
    return activeSockets;
}

function writeOnSocketByPort(sourcePort, message) {
    console.log(sourcePort)
    if(activeSockets.has(sourcePort)) {
        const socket = activeSockets.get(sourcePort).socket;
        console.log(sourcePort + "1")
        socketMain.write(socket, message);
    }
}


/*async function syncDeviceByPort(sourcePort) {
    const socket = activeSockets.get(sourcePort).socket;

    socketMain.write(socket, "Permissions");
    socketMain.write(socket, "Permissions granted");
    socketMain.write(socket, "API");
    socketMain.write(socket, "Model");
}*/
module.exports = {
    openSocketMain,
    getSocketsMap,
    writeOnSocketByPort
};
