import { Request, Response } from "express"
import { Role, Status, TypeUser } from "~/utils/Common/enum"
const { generateAccessToken, generateRefreshToken } = require('../config/jwt')
const User = require('../models/user')
const Organizer = require('../models/organizer')
const asyncHandler = require("express-async-handler")
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const sendMail = require('../config/sendMail')

const register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, username, dob, phone } = req.body;
    console.log(req.body);

    if (!email || !password || !dob || !username || !phone)
        return res.status(400).json({
            status: false,
            code: 400,
            message: 'Invalid input',
            result: "Missing input"
        });

    const user = await User.findOne({ email, phone });
    if (user) 
        throw new Error('User already exists');
    else {
        const newUser = new User(req.body);
        const otp = newUser.createOtp(); // Tạo OTP
        await newUser.save();

        let type = 'verify_account'
        // Send mail
        const html = `
        <div style="font-family: Arial, sans-serif; padding: 48px;">
            <img style="width: 100%; height: 100%;" src="" alt="Logo" />
            <div style="padding: 10px; gap: 32px;">
                <h1 style="font-size: 45px; margin-bottom: 10px;">Hi ${username},</h1>
                <div style="font-size: 20px; line-height: 3; margin-bottom: 1rem;">
                    <p>Thank you for registering with TicketNest. Please use the following OTP to verify your email address:</p>
                    <h2>${otp}</h2>
                </div>
                <div style="font-size: 20px; line-height: 3; margin-bottom: 1rem;">
                    <p>If you did not make this request, you can safely ignore this email.</p>
                    <p>Best Regards, <br><strong style="color: #396961;">TicketNest team</strong></p>
                </div>
                <hr>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="https://www.facebook.com/your-facebook-page-url" target="_blank" style="text-decoration: none; margin: 0 10px;">
                        <img src="" alt="Facebook" style="width: 60px; height: 60px;">
                    </a>
                    <a href="https://www.instagram.com/your-instagram-page-url" target="_blank" style="text-decoration: none; margin: 0 10px;">
                        <img src="" alt="Instagram" style="width: 60px; height: 60px;">
                    </a>
                </div>
                <hr>
                <div style="text-align: center;">
                    <p>&copy; 2024 TicketNest. All rights reserved.</p>
                    <br>
                    <p>You are receiving this mail because you registered to join the TicketNest platform as a user or a creator. This also shows that you agree to our Terms of Use and Privacy Policies. If you no longer want to receive mails from us, click the unsubscribe link below to unsubscribe.</p>
                    <p>
                        <a href="#" style="color: black; text-decoration: none;">Privacy Policy</a> •
                        <a href="#" style="color: black; text-decoration: none;">Terms of Service</a> •
                        <a href="#" style="color: black; text-decoration: none;">Help Center</a> •
                        <a href="#" style="color: black; text-decoration: none;">Unsubscribe</a>
                    </p>
                </div>
            </div>
        </div>`;

        const data = { email, html, type };
        await sendMail(data);

        return res.status(200).json({
            status: true,
            code: 200,
            message: 'User created successfully. OTP sent to email.',
            result: newUser
        });
    }
});

const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    if (!email || !otp)
        return res.status(400).json({
            status: false,
            code: 400,
            message: 'Invalid input',
            result: "Missing input"
        });

    const user = await User.findOne({ email });
    if (!user)
        return res.status(404).json({
            status: false,
            code: 404,
            message: 'User not found',
            result: "User not found"
        });

    if (!user.verifyOtp(otp)) {
        return res.status(400).json({
            status: false,
            code: 400,
            message: 'Invalid or expired OTP',
            result: "Invalid or expired OTP"
        });
    }

    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    return res.status(200).json({
        status: true,
        code: 200,
        message: 'OTP verified successfully',
        result: user,
    });
});


// RefreshToken => cấp mới accessToken
// AccessToken => Xác thực người dùng
const login = asyncHandler( async (req: Request, res: Response) => {
    const { email, password } = req.body
    if(!email || !password)
    return res.status(400).json({
        status: false,
        code: 400,
        message: 'Invalid input',
        result: "Missing input"
    })

    const response = await User.findOne({ email })
    if(response.isBlocked==true){
        return res.status(401).json({
            status: false,
            code: 401,
            message: 'Account is blocked',
            result: 'Invalid information'
        })
    }

    if(response && await response.isCorrectPassword(password)){
        //Tách password và role ra khỏi response
        const { password, role, refreshToken, ...userData } = response.toObject()
        //Tạo access Token
        const accessToken = generateAccessToken(response._id, role)
        //Tạo refresh token
        const newrefreshToken = generateRefreshToken(response._id)
        //Lưu refreshToken vào db
        await User.findByIdAndUpdate(response._id, {refreshToken: newrefreshToken} , {new: true})
        //Lưu refreshToken vào cookie
        res.cookie('refreshToken', newrefreshToken, {httpOnly: true, maxAge: 720000})
        return res.status(200).json({
            success: true,
            code: 200,
            accessToken,
            userData
        })
    }else{
        throw new Error('Invalid credential')
    }
})


const getCurrent = asyncHandler( async (req: Request, res: Response) => {
    const { _id } = req.user
    const user = await User.findById(_id).select('-refreshToken -password').populate('organizerRef')
    return res.status(200).json({
        status: user ? true : false,
        code: user ? 200 : 400,
        message : user ? 'User found' : 'User not found',
        result: user ? user : 'User not found'
    })
})

const refreshAccessToken = asyncHandler(async(req: Request, res: Response) => {
    const cookie = req.cookies
    // const { _id } = req
    if( !cookie && cookie.refreshToken) throw new Error('No refresh Token in cookie')

    const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
    const response = await User.findOne({ _id: rs._id, refreshToken: cookie.refreshToken })
    return res.status(200).json({
        status: response ? true : false,
        code: response? 200 : 400,
        message: response? 'Refresh token valid' : 'Refresh token invalid',
        result: response ? generateAccessToken(response._id, response.role) : 'Refresh Token invalid'
    })
})

const logout = asyncHandler(async(req: Request, res: Response) => {
    const cookie = req.cookies
    if(!cookie || !cookie.refreshToken) throw new Error('No refresh token in cookies')
    //Xóa refresh token ở db
    await User.findOneAndUpdate({refreshToken: cookie.refreshToken}, {refreshToken: ''}, {new: true})
    //Xóa refresh token ở trình duyệt
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true
    })
    return res.status(200).json({
        success: true,
        code: 200,
        message: 'Log out successfully',
        result: 'Log out successfully'
    })
})

//New format change
//Client gửi email
//Sever check email có hợp lệ hay không => Gửi mail và kèm theo link (password change token)
//Client check mail => click link
//Client gửi api kèm token
//Check token có giống với token mà sever gửi mail hay không
//Change password 

const forgotPassword = asyncHandler(async (req: Request, res: Response) => { 
    const { email } = req.body;
    if (!email) throw new Error('Missing email');
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found!! Invalid email');
    const otp = user.createOtp()
    await user.save();

    let type = 'forgot_password'
    // Send mail
    const html = `
    <div style="font-family: Arial, sans-serif; padding: 48px;">
    <img style="width: 100%; height: 100%;" src="" alt="Logo" />
    <div style="padding: 10px; gap: 32px;">
        <h1 style="font-size: 45px; margin-bottom: 10px;">Hi ${user.username},</h1>
        <div style="font-size: 20px; line-height: 3; margin-bottom: 1rem;">
            <p>You have requested a password reset for your TicketNest account. Please use the following OTP to reset your password:</p>
            <h2>${otp}</h2>
        </div>
        <div style="font-size: 20px; line-height: 3; margin-bottom: 1rem;">
            <p>If you did not make this request, you can safely ignore this email.</p>
            <p>Best Regards, <br><strong style="color: #396961;">TicketNest team</strong></p>
        </div>
        <hr>
        <div style="text-align: center; margin-top: 20px;">
            <a href="https://www.facebook.com/your-facebook-page-url" target="_blank" style="text-decoration: none; margin: 0 10px;">
                <img src="" alt="Facebook" style="width: 60px; height: 60px;">
            </a>
            <a href="https://www.instagram.com/your-instagram-page-url" target="_blank" style="text-decoration: none; margin: 0 10px;">
                <img src="" alt="Instagram" style="width: 60px; height: 60px;">
            </a>
        </div>
        <hr>
        <div style="text-align: center;">
            <p>&copy; 2024 TicketNest. All rights reserved.</p>
            <br>
            <p>You are receiving this mail because you registered to join the TicketNest platform as a user or a creator. This also shows that you agree to our Terms of Use and Privacy Policies. If you no longer want to receive mails from us, click the unsubscribe link below to unsubscribe.</p>
            <p>
                <a href="#" style="color: black; text-decoration: none;">Privacy Policy</a> •
                <a href="#" style="color: black; text-decoration: none;">Terms of Service</a> •
                <a href="#" style="color: black; text-decoration: none;">Help Center</a> •
                <a href="#" style="color: black; text-decoration: none;">Unsubscribe</a>
            </p>
        </div>
    </div>
</div>`;

    const data = { email, html, type };
    const rs = await sendMail(data);
    
    return res.status(200).json({
        status: true,
        code: 200,
        message: 'Send mail successfully',
        result: rs ? rs : "Failed to send mail"
    });
});

const verifyOtpAndResetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) throw new Error('Missing required fields')
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    if (!user.verifyOtp(otp)) throw new Error('Invalid or expired OTP');

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();
    return res.status(200).json({
        status: user ? true : false,
        code: user ? 200 : 400,
        message: user? 'Update password' : 'Something went wrong',
        result: user,
    })
})

//Lấy tất cả người dùng
const getAllUser = asyncHandler(async(req: Request, res: Response) => {
    const response = await User.find().select('-refreshToken -password -role').populate('organizerRef')
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400, 
        message: response ? 'Get all users' : 'Can not get all users', 
        result: response
    })
})

//Xóa tài khoản
const deleteUser = asyncHandler(async(req: Request, res: Response) => {
    const {_id} = req.query
    if(!_id) throw new Error('Please modified Id!!!')
    const response = await User.findByIdAndDelete(_id)
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? 'Delete user successfully' : 'User not found',
        result: response ? `User with email ${response.email} had been deleted` : 'User not found'
    })
})

//Cập nhập tài khoản người dùng hiện tại
const updateUser = asyncHandler(async(req: Request, res: Response) => {
    const {_id} = req.user
    if(!_id || Object.keys(req.body).length === 0) throw new Error('Please modified information!!!')
    const response = await User.findByIdAndUpdate(_id, req.body, {new: true}).select('-password -role')
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? `User with email ${response.email} had been updated` : 'Update user failed',
        result: response ? response : 'Something went wrong!!!!',
    })
})

//Tạo tài khoản người dùng bởi admin
const createAccountbyAdmin = asyncHandler(async(req: Request, res: Response) => {
    const { username, email, password, role } = req.body
    if(Object.keys(req.body).length === 0) throw new Error('Please modified information!!!')
    const response = await User.create({username, email, password, role})
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? `User with email ${response.email} had been updated` : 'Update user failed',
        result: response ? response : 'Something went wrong!!!!',
    })
})


//Cập nhập tài khoản người dùng bởi admin
const updateUserbyAdmin = asyncHandler(async(req: Request, res: Response) => {
    const { _id } = req.params
    if(Object.keys(req.body).length === 0) throw new Error('Please modified information!!!')
    const response = await User.findByIdAndUpdate(_id, req.body, {new: true}).select('-password -role -refreshToken')
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? `User with email ${response.email} had been updated` : 'Update user failed',
        result: response ? response : 'Something went wrong!!!!',
    })
})

//Cấm tài khoản người dùng bởi user
const banUserByAdmin = asyncHandler(async(req: Request, res: Response) => {
    const { uid } = req.params
    if(!uid) throw new Error('Please modified Id!!!')
    const user = await User.findById(uid).select('-password -role -refreshToken')
    const isBlocked = !user.isBlocked
    const response = await User.findByIdAndUpdate(uid, {isBlocked}, {new: true}).select('-password -role -refreshToken')
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? `User with email ${response.email} had been ban` : 'Ban user failed',
        result: response ? response : 'Something went wrong!!!!'
    })
})


const uploadImage= asyncHandler(async(req: Request, res: Response) => {
    const { _id } = req.user
    if(!req.file) throw new Error('Missing input files')
    const response = await User.findByIdAndUpdate(_id, {$set: {images: req.file?.path}}, {new: true})
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? 'Image uploaded successfully' : 'Can not upload image',
        result: response ? response : 'Can not upload file!!!!'
    })
})


const updateRolebyAdmin = asyncHandler(async(req: Request, res: Response) => {
    const { _id } = req.params
    if(!req.body.role) throw new Error('Please modified information!!!')
    const response = await User.findByIdAndUpdate(_id, {role: req.body.role}, {new: true}).select('-password -role -refreshToken')
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? 'Update role successfull' : 'Can not update role',
        result: response ? response : 'Something went wrong!!!!'
    })
})

const userRequestOrganizer = asyncHandler(async(req: Request, res: Response) => {
    const { _id } = req.user
    const { name, description, contact_email, contact_phone } = req.body;
    if(!name || !description) throw new Error('Missing information!!!')
    const user = await User.findById(_id)
    if(!user) throw new Error('User not found')
    
    // check user request exists

    if(user.organizerRequest == 'Processing' ) throw new Error(' You have already requested to become an organizer') 
    if(!req.body) throw new Error(`Please check your request ${req.body}`)
    user.organizerRequest = 'Processing' 
    await user.save()
    const response = await Organizer.create({name: name, description: description, 
        contact_email: contact_email, contact_phone: contact_phone , sponsor_by: _id})
    user.organizerRef = response._id
    await user.save()
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? 'User request has been sent' : 'Can not send user request',
        result: response ? response : 'Something went wrong!!!!'
    })
})

const organizerPermitByAdmin = asyncHandler(async(req: Request, res: Response) => {
    const { uid } = req.params
    const { permit } = req.body;
    const response = await User.findById(uid).populate('organizerRef')
    const  email  = response?.email
    if(!response) throw new Error('User not found')
    
    if(response.organizerRequest == 'Processing'){
        if( permit === Status.ACCEPTED)
            response.role = Role.ROLE_ORGANIZER
            response.type = TypeUser.ORGANIZER
            response.organizerRequest = permit
            await response.save()
    }
    //Send mail
    let type
    let html;

    if (permit === Status.ACCEPTED) {
        type = 'accepted'
        html = `
            <div style="font-family: Arial, sans-serif; padding: 48px;">
                <img style="width: 100%; height: 100%;" src="" alt="Logo" />
                <div style="padding: 10px; gap: 32px;">
                    <h1 style="font-size: 45px; margin-bottom: 10px;">Hi ${response.username},</h1>
                    <div style="font-size: 20px; line-height: 3; margin-bottom: 1rem;">
                        <p>You have requested to become an organizer.</p>
                    </div>
                    <br>
                    <br>
                    <div style="text-align: center;">
                        <a style="display: inline-block; padding: 20px 45px; background-color: #396961; color: white; 
                        border-radius: 10px; max-width: 400px; font-size: 20px; 
                        text-decoration: none; text-align: center;">You have been promoted to an Organizer</a>
                    </div>
                    <div style="font-size: 20px; line-height: 3; margin-bottom: 1rem;">
                        <p>If you did not make this request, you can safely ignore this email.</p>
                        <p>Best Regards, <br><strong style="color: #396961;">TicketNest team</strong></p>
                    </div>
                    <hr>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="https://www.facebook.com/your-facebook-page-url" target="_blank" style="text-decoration: none; margin: 0 10px;">
                            <img src="" alt="Facebook" style="width: 60px; height: 60px;">
                        </a>
                        <a href="https://www.instagram.com/your-instagram-page-url" target="_blank" style="text-decoration: none; margin: 0 10px;">
                            <img src="" alt="Instagram" style="width: 60px; height: 60px;">
                        </a>
                    </div>
                    <hr>
                    <div style="text-align: center;">
                        <p>&copy; 2024 TicketNest. All rights reserved.</p>
                        <br>
                        <p>You are receiving this mail because you registered to join the TicketNest platform as a user or a creator. This also shows that you agree to our Terms of Use and Privacy Policies. If you no longer want to receive mails from us, click the unsubscribe link below to unsubscribe.</p>
                        <p>
                            <a href="#" style="color: black; text-decoration: none;">Privacy Policy</a> •
                            <a href="#" style="color: black; text-decoration: none;">Terms of Service</a> •
                            <a href="#" style="color: black; text-decoration: none;">Help Center</a> •
                            <a href="#" style="color: black; text-decoration: none;">Unsubscribe</a>
                        </p>
                    </div>
                </div>
            </div>`;
    } else if (permit === Status.REJECTED) {
        type ='reject'
        html = `
            <div style="font-family: Arial, sans-serif; padding: 48px;">
                <img style="width: 100%; height: 100%;" src="" alt="Logo" />
                <div style="padding: 10px; gap: 32px;">
                    <h1 style="font-size: 45px; margin-bottom: 10px;">Hi ${response.username},</h1>
                    <div style="font-size: 20px; line-height: 3; margin-bottom: 1rem;">
                        <p>We regret to inform you that your request to become an organizer has been denied.</p>
                    </div>
                    <br>
                    <br>
                    <div style="text-align: center;">
                        <a style="display: inline-block; padding: 20px 45px; background-color: #FF0000; color: white; 
                        border-radius: 10px; max-width: 400px; font-size: 20px; 
                        text-decoration: none; text-align: center;">Request Denied</a>
                    </div>
                    <div style="font-size: 20px; line-height: 3; margin-bottom: 1rem;">
                        <p>If you have any questions, feel free to contact our support team.</p>
                        <p>Best Regards, <br><strong style="color: #FF0000;">TicketNest team</strong></p>
                    </div>
                    <hr>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="https://www.facebook.com/your-facebook-page-url" target="_blank" style="text-decoration: none; margin: 0 10px;">
                            <img src="" alt="Facebook" style="width: 60px; height: 60px;">
                        </a>
                        <a href="https://www.instagram.com/your-instagram-page-url" target="_blank" style="text-decoration: none; margin: 0 10px;">
                            <img src="" alt="Instagram" style="width: 60px; height: 60px;">
                        </a>
                    </div>
                    <hr>
                    <div style="text-align: center;">
                        <p>&copy; 2024 TicketNest. All rights reserved.</p>
                        <br>
                        <p>You are receiving this mail because you registered to join the TicketNest platform as a user or a creator. This also shows that you agree to our Terms of Use and Privacy Policies. If you no longer want to receive mails from us, click the unsubscribe link below to unsubscribe.</p>
                        <p>
                            <a href="#" style="color: black; text-decoration: none;">Privacy Policy</a> •
                            <a href="#" style="color: black; text-decoration: none;">Terms of Service</a> •
                            <a href="#" style="color: black; text-decoration: none;">Help Center</a> •
                            <a href="#" style="color: black; text-decoration: none;">Unsubscribe</a>
                        </p>
                    </div>
                </div>
            </div>`;
    }

    const data = { email, html , type};
    await sendMail(data);
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? `User with email ${response.email} has been promoted to organizer.` : 'Can not send user request',
        result: response ? response : 'Something went wrong!!!!'
    })
})

module.exports = {
    register,
    login,
    getCurrent,
    refreshAccessToken,
    logout,
    forgotPassword,
    verifyOtpAndResetPassword,
    getAllUser,
    deleteUser,
    updateUser,
    createAccountbyAdmin,
    updateUserbyAdmin,
    banUserByAdmin,
    uploadImage,
    updateRolebyAdmin,
    userRequestOrganizer,
    organizerPermitByAdmin
}