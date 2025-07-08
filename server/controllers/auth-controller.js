import bcrypt from 'bcrypt';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import Verification from '../models/verification.js';
import sendEmail from '../libs/send-email.js';
import aj from '../libs/arcjet.js';


const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const decision = await aj.protect(req, { email });
        console.log("Arcjet decision", decision);

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                res.writeHead(403, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Invalid email" }));
            }
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
            { userId: newUser._id, property: 'email-verification' },
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
            newUser.email,
            emailSubject,
            emailBody
        );

        if (!isEmailSent) {
            return res.status(500).json({
                message: 'Failed to send verification email. Please try again later.',
            });
        }
        
        res.status(201).json({
            message: 'Verification email sent to your email address. Please verify your account.',
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
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal Server Error',
        });
    }
};

export { registerUser, loginUser };