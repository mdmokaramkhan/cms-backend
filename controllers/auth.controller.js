export const initiateSignup = async (req, res) => {
    try {
        const { email } = req.body;
        if(!email) {
            return res.status(400).send({
                success: false,
                message: "email is required"
            })
        }

        const result = await initiateSignup(email);

        res.status(200).send({
            success: true,
            message: "OTP sent successfully",
            ...result
        })
        
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message,
        })
    }
}
