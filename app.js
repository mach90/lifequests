/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const path = require("path"); //used to manipulate path names
const express = require("express"); //nodejs framework
const morgan = require("morgan"); //npm i morgan, HTTP request logger middleware, logs HTTP requests on terminal or file
const rateLimit = require("express-rate-limit"); //npm i express-rate-limit, request rate limiting
const helmet = require("helmet"); //npm i helmet, helmet security HTTP headers
const mongoSanitize = require("express-mongo-sanitize"); //npm i express-mongo-sanitize, against NoSQL Query Injection
const xss = require("xss-clean"); //npm i xss-clean, against xss attacks
const hpp = require("hpp"); //npm i hpp, clear query parameters duplicates
const cookieParser = require("cookie-parser"); //npm i cookie-parser
const compression = require("compression"); //npm i compression, to compress responses
const cors = require("cors"); //npm i cors

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const companyRouter = require("./routes/companyRoutes");
const userRouter = require("./routes/userRoutes");
const questRouter = require("./routes/questRoutes");
const guildRouter = require("./routes/guildRoutes");

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
EXPRESS APP
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const app = express();

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
MIDDLEWARES
████████████████████████████████████████████████████████████████████████████████████████████████████ */
/* //////////////////////////////////////////////////
CORS CROSS ORIGIN RESSOURCE SHARING
If you want to limit for certain routes only:
- remove app.use(cors());
- add to route app.use("/api/v1/tours", cors(), tourRouter);
If you want to allow only on certain domains:
app.use(cors({
  origin: "https://www.domainname.com"
}));
////////////////////////////////////////////////// */
app.use(cors());

/* TO SERVE STATIC FILES */
app.use(express.static(path.join(__dirname, "public")));

/* SET HTTP SECURITY HEADERS WITH HELMET 🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑 */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        scriptSrc: [
          "'self'",
          'https:',
          'http:',
          'blob:',
          'https://*.mapbox.com',
          'https://js.stripe.com',
          'https://m.stripe.network',
          'https://*.cloudflare.com',
        ],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        workerSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://*.tiles.mapbox.com',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://m.stripe.network',
        ],
        childSrc: ["'self'", 'blob:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        formAction: ["'self'"],
        connectSrc: [
          "'self'",
          "'unsafe-inline'",
          'data:',
          'blob:',
          'https://*.stripe.com',
          'https://*.mapbox.com',
          'https://*.cloudflare.com/',
          'https://bundle.js:*',
          'ws://127.0.0.1:*/',

        ],
        upgradeInsecureRequests: [],
      },
    },
  })
);

/* DEVELOPMENT LOGGING WITH MORGAN */
if(process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

/* RATE LIMITING TO ALL THE API */
const limiter = rateLimit({
    max: 100, //100 requests per IP
    windowMs: 3600 * 1000, // per hour
    message: "Too many requests from this IP, please try again in an hour."
});
app.use("/api", limiter);

/* BODY PARSER, READING DATA FROM BODY INTO REQ.BODY */
app.use(express.json({limit: "10kb"}));

/* COOKIE PARSER */
app.use(cookieParser());

/* DATA SANITIZATION (against NoSQL query injection) */
app.use(mongoSanitize());

/* DATA SANITIZATION (against XSS attacks) */
app.use(xss());

/* PREVENTING PARAMETER POLLUTION 🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧 */
app.use(hpp({
    whitelist: ["duration", "ratingsQuantity", "ratingsAverage", "maxGroupSize", "difficulty", "price"]
}));

/* COMPRESS MIDDLEWARE */
app.use(compression());

/* TEST */
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.headers);
    // console.log(req.cookies);
    next();
});

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
ROUTES
████████████████████████████████████████████████████████████████████████████████████████████████████ */
/* API ROUTES */
app.use("/api/v1/companies", companyRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/quests", questRouter);
app.use("/api/v1/guilds", guildRouter);

/* MIDDLEWARE FOR ALL OTHER UNHANDLED ROUTES */
app.all("*", (req, res, next) =>{
    next(new AppError(`Can't find ${req.originalUrl} on this server...`, 404));
});

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
ERROR HANDLING MIDDLEWARE
Will receive the errors and send the res (instead of having multiple middlewares that send their
own res error)
████████████████████████████████████████████████████████████████████████████████████████████████████ */
app.use(globalErrorHandler);

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
EXPORT
████████████████████████████████████████████████████████████████████████████████████████████████████ */
module.exports = app;