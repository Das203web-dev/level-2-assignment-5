import express, { Request, Response } from "express"
import { routes } from "./app/routes";
import cors from "cors"
import passport from "passport";
import cookieParser from "cookie-parser"
import expressSession from "express-session"
import "./app/config/passport"
import { globalErrorHandler } from "./app/middlewares/globalError";
import { notFound } from "./app/middlewares/notFound";

const app = express();
app.use(expressSession({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser())
app.use(express.json())
app.use(cors())
app.use("/api", routes)
app.get("/", async (req: Request, res: Response) => {
    res.status(200).send("Welcome to parcel delivery system")
})

app.use(globalErrorHandler)
app.use(notFound)
export default app