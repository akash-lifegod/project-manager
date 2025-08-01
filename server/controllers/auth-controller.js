import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Verification from '../models/verification.js';
import sendEmail from '../libs/send-email.js';
import validator from 'deep-email-validator'


const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        //diff here
        const emailValidation = await validator.default({
            email,
            validateRegex: true,
            validateMx: true,
            validateTypo: false,
            validateDisposable: true,
            validateSMTP: true,
        });
        console.log('isEmailValid :',emailValidation.valid);

        if (!emailValidation.valid) {
            res.writeHead(403, {
                'Content-Type': 'application/json',
            });
            res.end(JSON.stringify({message: 'Invalid email address'}));
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists',
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // TODO: Send verification email
        const verificationToken = jwt.sign(
            { userId: newUser._id, purpose: 'email-verification' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        await Verification.create({
            userId: newUser._id,
            token: verificationToken,
            expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        });

        // Send verification email logic here
        const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
        const emailBody = `
            <h1>Verify Your Email</h1>
            <p>Click the link below to verify your email address:</p>
            <a href="${verificationLink}">Verify Email</a>
        `;
        const emailSubject = 'Email Verification';

        const isEmailSent = await sendEmail(
            email,
            emailSubject,
            emailBody
        );

        if (!isEmailSent) {
            return res.status(500).json({
                message: 'Failed to send verification email. Please try again later.',
            });
        }
        
        res.status(201).json({
            message: 'Verification email sent. Please verify your account.',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal Server Error',
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email}).select("+password");

        if(!user){
            return res.status(400).json({message: "Invalid Email or Password"});
        }

        if(!user.isEmailVerified){
            const existingVerification = await Verification.findOne({
                userId: user._id,
            });

            if((existingVerification && existingVerification.expiresAt > new Date())){
                return res.status(400).json({
                    message:"Email not Verified. Please check your email for the verification link."
                });
            } else {
                await Verification.findByIdAndDelete(existingVerification._id);

                const verificationToken = jwt.sign(
                    {userId: user._id, purpose: "email-verification"},
                    process.env.JWT_SECRET,
                    {expiresIn: "1h"}
                );

                await Verification.create({
                    userId: user._id,
                    token: verificationToken,
                    expiresAt: new Date(Date.now() + 1*60*60*1000),
                });

                const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
                const emailBody = `
                    <h1>Verify Your Email</h1>
                    <p>Click the link below to verify your email address:</p>
                    <a href="${verificationLink}">Verify Email</a>
                `;
                const emailSubject = 'Email Verification';

                const isEmailSent = await sendEmail(
                    email,
                    emailSubject,
                    emailBody
                );

                if (!isEmailSent) {
                    return res.status(500).json({
                        message: 'Failed to send verification email. Please try again later.',
                    });
                }
                
                res.status(201).json({
                    message: 'Verification email sent. Please verify your account.',
                });
            }
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({message: "Invalid email or password"});
        }

        const token = jwt.sign(
            {userId: user._id, purpose:"login"},
            process.env.JWT_SECRET,
            {expiresIn: "7d"}
        );

        user.lastLogin = new Date();
        await user.save();
        
        const userData = user.toObject();
        delete userData.password;

        res.status(200).json({
            message: "Login Successful",
            token, 
            user: userData,
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal Server Error',
        });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const {token} = req.body;

        const payload = jwt.verify(token, process.env.JWT_SECRET);

        if(!payload){
            return res.status(401).json({
                message: 'Unauthorized',
            });
        }

        const {userId, purpose} = payload;

        if(purpose !== 'email-verification') {
            return res.status(401).json({
                message: 'Unauthorized',
            });
        }

        const verification = await Verification.findOne({
            userId,
            token,
        });

        if (!verification) {
            return res.status(401).json({
                message: 'Unauthorized',
            });
        }

        const isTokenExpired = verification.expiresAt < new Date();

        if (isTokenExpired) {
            return res.status(401).json({
                message: 'Verification token has expired.',
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                message: 'Email is already verified',
            });
        }

        user.isEmailVerified = true;
        await user.save();

        await Verification.findByIdAndDelete(verification._id);

        res.status(200).json({
            message: 'Email verified successfully',
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal Server Error',
        });
    }
};

const resetPasswordRequest = async (req, res) => {
    try{
        const {email} = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({message: "User not found"});
        }
        if(!user.isEmailVerified) {
            return res.status(400).json({message: "Please verify your email"});
        }

        const existingVerification = await Verification.findOne(
            {userId: user._id,}
        );

        if(existingVerification && existingVerification.expiresAt > new Date()) {
            return res.status(400).json({
                message: "Reset Password request already sent",
            });
        }

        if(existingVerification && existingVerification.expiresAt < new Date()) {
            await Verification.findByIdAndDelete(existingVerification._id);
        }

        const resetPasswordToken = jwt.sign(
            { userId: user._id, purpose: "reset-password" },
            process.env.JWT_SECRET,
            {expiresIn: "15m"}
        );

        await Verification.create({
            userId: user._id,
            token: resetPasswordToken,
            expiresAt: new Date(Date.now() + 15*60*1000),
        });

        const resetPasswordLink = `${process.env.CLIENT_URL}/reset-password?token=${resetPasswordToken}`;
        const emailBody = `
                    <h1>Reset Your Password</h1>
                    <p>Click the link below to reset your password:</p>
                    <a href="${resetPasswordLink}">Reset Password</a>
        `;
        const emailSubject = "Reset Password";

        const isEmailSent = await sendEmail(email, emailSubject, emailBody);

        if(!isEmailSent) {
            return res.status(500).json({
                message: "Failed to send reset password link email"
            });
        }

        res.status(200).json({message: "Reset password email sent"});
    } catch(error){
        console.log(error);
        res.status(500).json({
            message : "Internal Server Error"
        });
    }
}

const verifyResetPasswordTokenAndResetPassword = async (req, res) => {
    try{
        const {token, newPassword, confirmPassword} = req.body;
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        if(!payload){
            return res.status(401).json({
                message: "Unauthorized"
            });
        };

        const {userId, purpose} = payload;
        if(purpose != "reset-password"){
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const verification = await Verification.findOne({
            userId,
            token,
        })

        if(!verification){
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const isTokenExpired = verification.expiresAt < new Date();

        if(isTokenExpired){
            return res.status(401).json({
                message: "Token Expired"
            });
        };

        const user = await User.findById(userId);
        if(!user){
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        if(newPassword != confirmPassword){
            return res.status(401).json({
                message: "Passwords do not match"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();
        await Verification.findByIdAndDelete(verification._id);
        
        return res.status(201).json({ message: "Password reset successfully"});

    } catch(error){
        console.log(error);
        res.status(500).json({
            message : "Internal Server Error"
        });
    }
}

export { registerUser, loginUser, verifyEmail, resetPasswordRequest, verifyResetPasswordTokenAndResetPassword };