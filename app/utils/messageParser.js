const HOSTNAME = process.env.HOSTNAME || "localhost";

function parseApi(message) {
    return message.split('API:')[1].toString();
}
function parseModel(message) {
    return message.split('Model:')[1].toString();
}
function parsePermissions(message) {
    const permissionsString = message.split('Permissions:')[1].toString();

    let permissions = permissionsString.split('|');
    return permissions.slice(0, permissions.length - 1);
}
function parseGrantedPermissions(message) {
    const permissionsString = message.split('Permissions Granted:')[1].toString();

    let permissions = permissionsString.split('|');
    return permissions.slice(0, permissions.length - 1);
}

function parseAttack(device, payload, collectedString) {
    const tIndex = collectedString.toString().indexOf("Timing: ");
    const rIndex = collectedString.toString().indexOf("|");

    const timingString = collectedString.toString().substring(tIndex+8, rIndex);
    const timings = timingString.split('~');

    const resultString = collectedString.toString().substring(rIndex+9);

    return {
        device: device,
        payload_id: payload._id,
        result: resultString,
        timing: {
            download_time: parseFloat(timings[0]),
            parse_time: parseFloat(timings[1]),
            compile_time: parseFloat(timings[2]),
            dynamic_loading_time: parseFloat(timings[3]),
            execution_time: parseFloat(timings[4])
        },
        resultType: payload.resultType
    };
}


function codeSenderStringBuilder(codeSenderPorts){
    let serversListStringed = "";
    for (let i = 0; i < codeSenderPorts.length; i++) {
        serversListStringed += HOSTNAME + ":" + codeSenderPorts[i] + "|";
    }

    return serversListStringed
}

function collectorStringBuilder(collectorPort){
    return HOSTNAME + ':' + collectorPort
}

module.exports = {
    parseApi,
    parseModel,
    parsePermissions,
    parseGrantedPermissions,
    codeSenderStringBuilder,
    collectorStringBuilder,
    parseAttack
}