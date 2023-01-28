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

const port = process.env.PORT || 6002;


// handling uncaught exception
process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`server is shutting down due to handling uncaught exception`);

    process.exit(1)
})



// Middlewares
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
app.use(helmet.xssFilter());
// DNS prefetchingControl
app.use(helmet.dnsPrefetchControl({ allow: true, }));



// setting cors with the specific url
app.use(cors({
    credentials: true,
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    // allowedHeaders: ['Content-Type','Accept','']
}))



// limiting each ip to send limited requests
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minute
    max: 30, // Limit each IP to 30 requests per `window` (here, per 5 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
// Apply the rate limiting middleware to all requests
app.use(limiter)

// app.set('trust proxy', false);
app.use((req, res, next) => {
    res.set('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    // console.log("user request headers", Object.values(req.rawHeaders));
    // console.log("user ip", req.ip);
    // console.log("auth header", req.headers.authorization);
    next()
})


app.get("/", (req, res) => {
    res.status(200).json({ message: "working" })
})








// app.use(session({
//     secret: 'Keep it secret',
//     name: 'uSid',
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         httpOnly: true,
//         maxAge: 3600000
//     }
// }))
// app.use(passport.initialize());
// app.use(passport.session())

// app.use((req, res, next) => {
//     console.log(req.session);
//     next()
// })


// auto logout user
// app.use((req, res, next) => {
//     const { RfT: refreshTokenFormACookie, AcsT: AccessToken } = req.cookies;
//     if (refreshTokenFormACookie || AccessToken) {
//         console.log(AccessToken, 'Access Token');
//         console.log(refreshTokenFormACookie, 'Refresh Token');
//         setTimeout(() => {
//             req.userPoint = "";

//             console.log("hamza qureshi");
//         }, 1000 * 60 * 2)
//     }

//     next()
// })



// for static images or avatar url
app.use('/Storage', express.static(path.join(__dirname, '../Storage')));



// Api Routes
app.use("/api", routes)

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


module.exports=app