const crypto = require('./CryptoUtil')

/**
 * Returns javaCode minified, removing tabs and spaces
 * @param javaCode to minify
 * @returns {string} javaCode minified
 */
function minifyJavaCode(javaCode){
    const stringEscaped = javaCode.toString().replace(/(\r\n|\n|\r|\t)/gm, '');
    return stringEscaped.replace(/ +(?= )/g, '');
}

/**
 * Returns a random subset split of the javaCode
 * @param javaCode to split
 * @returns {[]}
 */
function splitJavaCode(javaCode) {
    const stringLength = javaCode.length - 1;
    let javaPieces = [];

    let i = 0;
    while(i <= stringLength) {
        const newIndex = i + crypto.getRandomInteger(1, stringLength/6);
        const substringLenght = newIndex - i  + 1;
        javaPieces.push(javaCode.substr(i, substringLenght));
        i = newIndex + 1;
    }

    return javaPieces;
}

module.exports = {
    minifyJavaCode,
    splitJavaCode
}