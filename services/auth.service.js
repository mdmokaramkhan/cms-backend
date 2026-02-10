import OTP from '../models/otp.js';

// 1. sendOtp on email get email from query
export const initiateSignupService = async (email) => {
    try {
        
        const isAlreadyExist = await OTP.findOne({email: email})
        if(isAlreadyExist) {
            throw new Error("email id already exist");
        }

        await OTP.deleteMany({email: email})
        const otp = generateOTP()

        await OTP.create({
            email,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        })

        return {
            email,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        }

    } catch (error) {
        throw new Error(error.message);
    }
}
