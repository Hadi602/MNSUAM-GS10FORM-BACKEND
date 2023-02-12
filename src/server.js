const dotenv = require('dotenv');
dotenv.config();
require('./connection/conn')
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser")
const cors = require('cors');
const path = require("path")
const session = require('express-session')
const routes = require('../router/routes')
const errorHandlerMiddleware = require('../middlewares/error')
const app = express();
const rateLimit = require('express-rate-limit')
const compression = require('compression')
const mongoSanitize = require('express-mongo-sanitize');

const port = process.env.PORT || 6002;


// handling uncaught exception
process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`server is shutting down due to handling uncaught exception`);

    process.exit(1)
})



// setting cors with the specific url
app.use(cors({
    credentials: true,
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    // allowedHeaders: ['Content-Type','Accept','']
}))




// Middlewares
// Set compression before any routes
app.use(compression({ threshold: 450 })); //smaller than this will not be compress
app.use(mongoSanitize()); //{ allowDots: true, replaceWith: '_' } can pass these options if needed by default remove ($)and(.) from any rqs
app.use(express.json({ limit: '30mb' }));
app.use(cookieParser({ limit: '30mb' }))
app.use(express.urlencoded({ extended: true }));//nested json data are true
app.use(morgan("common"))
app.use(helmet())
// prevent clickjacking
app.use(helmet.frameguard({ action: "deny", }));
// X-Powered-By removing express
app.use(helmet.hidePoweredBy());
// X-Download-Options preventing potentially unsave downloads
app.use(helmet.ieNoOpen());
// preventing mime type sniffing
app.use(helmet.noSniff());
// preventing X-Xss 
app.use(helmet.xssFilter({}));
// DNS prefetchingControl
app.use(helmet.dnsPrefetchControl({ allow: true, }));




// limiting each ip to send limited requests
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minute
    max: 30, // Limit each IP to 30 requests per `window` (here, per 5 minutes)
    standardHeaders: false, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
// Apply the rate limiting middleware to all requests
app.use(limiter)

// app.set('trust proxy', false);
app.use((req, res, next) => {
    res.set('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    res.set('cross-origin-resource-policy', 'http://localhost:5173/'); //for sharing resources such as images if not set then images will not be get on client side must read more about cross same lax origin
    // console.log("auth header", req.headers.authorization,req.ip);
    next()
})
app.use((req, res, next) => {
    res.set('X-XSS-Protection', '1; mode=block')
    next()
})




app.get("/", (req, res) => {
    res.status(200).json({ message: "working" })
})






// for static images or avatar url
app.use('/Storage', express.static(path.join(__dirname, '../Storage')));



// Api Routes
app.use("/api", routes)
app.all("*", (req, res) => {
    res.status(404)
    if (req.accepts('json')) {
        res.json({ message: "Not Found!" })
    } else {
        res.type('txt').send('Not Found!')
    }
})

// error handler
app.use(errorHandlerMiddleware)


const server = app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})


//  unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err}`);
    console.log(`server is shutting down due to unhandled promise rejection`);

    server.close(() => {
        process.exit(1)
    })
})


module.exports = app