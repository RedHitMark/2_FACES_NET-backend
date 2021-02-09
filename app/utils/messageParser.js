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

module.exports = {
    parseApi,
    parseModel,
    parsePermissions,
    parseGrantedPermissions
}