import { generateOTP } from "../helperFunction/helperfunction";
import { OTP } from "../modules/otp/otp.model";
import { sendEmail } from "./sendEmail";

// export const sendOTPEmail = async (receiverId: string, parcelId: string, attempt: number, email: string, otpFor: string, deliveryManId = "") => {
//     const otp = generateOTP()
//     const findOtp = await OTP.findOne({ parcelId });
//     if (findOtp) {
//         await OTP.findOneAndUpdate({ parcelId }, { $set: { otp } }, { new: true })
//     }
//     else {

//         await OTP.create({
//             userId: receiverId ? receiverId : deliveryManId,
//             parcelId: parcelId,
//             expireTime: new Date(Date.now() + 60 * 60 * 1000),
//             otp,
//             otpFor,
//             attempt,
//             coolDownTime: new Date(),
//             maxLimit: 2
//         })
//     }
//     await sendEmail({
//         emailTo: email,
//         subject: `Your parcel delivery verification OTP`,
//         templateName: "otpVerification",
//         templateData: {
//             otp
//         }
//     })
// }


// Fixed sendOTPEmail function
export const sendOTPEmail = async (receiverId: string, parcelId: string, attempt: number, email: string, otpFor: string, deliveryManId = "") => {
    const otp = generateOTP();
    const findOtp = await OTP.findOne({ parcelId });

    if (findOtp) {
        // Update existing OTP
        await OTP.findOneAndUpdate(
            { parcelId },
            {
                $set: {
                    otp,
                    expireTime: new Date(Date.now() + 60 * 60 * 1000), // Reset expiry time
                    attempt: attempt // Set proper attempt count
                }
            },
            { new: true }
        );
    } else {
        // Create new OTP record
        await OTP.create({
            userId: receiverId ? receiverId : deliveryManId,
            parcelId: parcelId,
            expireTime: new Date(Date.now() + 60 * 60 * 1000),
            otp,
            otpFor,
            attempt: 3, // Start with 3 attempts
            coolDownTime: new Date(), // No cooldown for first OTP
            maxLimit: 2 // Maximum 2 OTP generations allowed
        });
    }

    await sendEmail({
        emailTo: email,
        subject: `Your parcel delivery verification OTP`,
        templateName: "otpVerification",
        templateData: {
            otp
        }
    });
}