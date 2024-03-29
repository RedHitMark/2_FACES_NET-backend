/** APP Dependencies **/
const express = require('express');
const dotenv = require('dotenv')
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const helmet = require("helmet");
const path = require('path');

if (!process.env.DOCKER_RUNNING) {
    dotenv.config({path: './backend.env'});
}

/** Create a new Express APP **/
const app = express();


/** Middlewares **/
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ /*origin: process.env.HOSTNAME*/}));
app.use(compression());
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'","'unsafe-inline'", 'fonts.googleapis.com', "cdnjs.cloudflare.com", 'fonts.gstatic.com'],
        blockAllMixedContent: [],
        frameAncestors: []
    }
}));
app.use(express.static('web/public'));


/** Web Views **/
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'web/views'));


/** Open socketManager **/
const socketManager = require('./socket/socketManager');
socketManager.initSocketMain();


/** Web Router **/
const webRouter = require('./web/webRouter');
app.use('/web', webRouter);


/** API Router **/
const apiRouter = require('./api/apiRouter');
app.use('/api', apiRouter);


/** Catch 404 error **/
app.use((req, res, next) => {
    res.status(404).json({message : "not found on this server"});
});


/** Export Express APP **/
module.exports = app;
