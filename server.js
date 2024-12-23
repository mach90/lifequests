/* //////////////////////////////////////////////////
ENVIRONMENT VARIABLES
////////////////////////////////////////////////// */
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

/* //////////////////////////////////////////////////
MONGOOSE
////////////////////////////////////////////////// */
const mongoose = require("mongoose");

/* //////////////////////////////////////////////////
APP
////////////////////////////////////////////////// */
const app = require("./app");

/* //////////////////////////////////////////////////
DATABASE CONNECTION
////////////////////////////////////////////////// */
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

dbConnect().catch(err => console.log(err));

async function dbConnect() {
    await mongoose.connect(DB).then(con => {
        // console.log(con.connections);
        console.log("🔌🔌🔌Database connection successful🔌🔌🔌")
    });
}

/* //////////////////////////////////////////////////
SERVER START & LISTEN
////////////////////////////////////////////////// */
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});

/* //////////////////////////////////////////////////
UNHANDLED REJECTIONS
////////////////////////////////////////////////// */
process.on("unhandledRejection", err => {
    console.error("Unhandled rejection detected:", err);
    server.close(() => {
        /* We first close the server gracefully, then exit process, that way the server
        can finish all the request that are still pending or being handled*/
        process.exit(1); //1 is code for uncaught exceptions, 0 is for success
    });
});

/* //////////////////////////////////////////////////
UNCAUGHT EXCEPTIONS
////////////////////////////////////////////////// */
process.on("uncaughtException", err => {
    console.error("Unhandled rejection detected:", err);
    process.exit(1); //1 is code for uncaught exceptions, 0 is for success
});