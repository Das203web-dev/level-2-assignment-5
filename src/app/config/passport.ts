import passport from "passport";
import { envVariables } from "./env";
import { Strategy as GoogleStrategy, VerifyCallback, Profile } from "passport-google-oauth20";
import { User } from "../modules/user/user.model";
import { Strategy as LocalStrategy } from "passport-local";
// import { Request, Response } from "express";
import bcrypt from "bcryptjs"
import { Role } from "../modules/user/user.interface";

// for local login using pass 
passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    }, async (email: string, password: string, done: any) => {
        const isUserExist = await User.findOne({ email })
        if (!isUserExist) {
            return done(null, false, { message: "User does not exist" });
        }
        const isUserAuthenticateUsingGoogle = isUserExist.auths.some(auth => auth.provider === "google");
        if (isUserAuthenticateUsingGoogle) {
            return done("You have authenticate using google. So log in using google or create a password to login using email and password")
        }
        const matchPassword = await bcrypt.compare(password as string, isUserExist.password as string);
        if (!matchPassword) {
            return done(null, false, { message: "Password does not match" })
        }
        return done(null, isUserExist)
    })
)

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user._id)
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.deserializeUser(async (id: any, done: any) => {
    try {
        const user = await User.findById(id)
        done(null, user)
    } catch (error) {
        done(error)
    }
})


// for google login
// passport.use(
//     new GoogleStrategy({
//         clientID: envVariables.GOOGLE_CLIENT_ID,
//         clientSecret: envVariables.GOOGLE_CLIENT_SECRET,
//         callbackURL: envVariables.GOOGLE_CALLBACK
//     }, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
//         try {
//             const email = profile.emails?.[0].value;
//             // console.log(email, "inside passport google");
//             if (!email) {
//                 return done(null, false, { message: "No email found" })
//             }
//             let user = await User.findOne({ email });
//             if (!user) {
//                 user = await User.create({
//                     name: profile?.displayName,
//                     email: profile.emails?.[0].value,
//                     isVerified: true,
//                     role: Role.SENDER,
//                     auths: [{
//                         provider: profile.provider,
//                         providerId: profile.id
//                     }]
//                 })
//             }
//             return done(null, user)
//         } catch (error) {
//             return done(error)
//         }
//     })
// )