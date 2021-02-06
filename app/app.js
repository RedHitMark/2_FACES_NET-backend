/** APP Dependencies **/
const express = require('express');

const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const helmet = require("helmet");
const path = require('path');


/** Create a new Express APP **/
const app = express();


/** Middlewares **/
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(compression());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'","'unsafe-inline'","'unsafe-eval'", 'fonts.googleapis.com', "cdnjs.cloudflare.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        fontSrc:["'self'",'fonts.googleapis.com','fonts.gstatic.com', 'cdnjs.cloudflare.com']
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


/** Export Express APP**/
module.exports = app;
