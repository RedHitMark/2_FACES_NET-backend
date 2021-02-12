/** Server Dependencies **/
const http = require('http');
const app = require('./app');


/** Define the server PORT **/
const PORT = process.env.SERVER_PORT || 9999;
app.set('port', PORT);


/** Create a new HTTP server instance **/
const server = http.createServer(app);


/** Start server and make it listen on a PORT **/
server.listen(PORT);


/** Server Callbacks **/
server.on('listening', () => {
    console.log('Server started and listening on port ' + PORT);
});
server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(PORT + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(PORT + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
});