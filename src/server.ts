import { Server } from "http"
import mongoose from "mongoose";
import app from "./app";
import { envVariables } from "./app/config/env";
import { seedAdmin } from "./app/utils/seedAdmin";
let server: Server;
const serverConnect = async () => {

    try {
        await mongoose.connect(envVariables.DB_URL)
        console.log("connected to db");
        server = app.listen(envVariables.PORT, () => {
            console.log(`listening to port ${envVariables.PORT}`);
        })
    } catch (error) {
        console.log(error);
    }
}
(
    async () => {
        await serverConnect()
        await seedAdmin()
    }
)()

process.on("SIGTERM", () => {
    console.log("SIGTERM MESSAGE RECEIVED...SERVER IS SHUTTING DOWN");
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
});
process.on("SIGINT", () => {
    console.log("SIGINT MESSAGE RECEIVED...SERVER IS SHUTTING DOWN");
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
});
process.on("unhandledRejection", (error) => {
    console.log("UNHANDLED REJECTION DETECTED...SERVER IS SHUTTING DOWN", error);
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
});
process.on("uncaughtException", (error) => {
    console.log("UNCAUGHT EXCEPTION DETECTED...SERVER IS SHUTTING DOWN", error);
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
})