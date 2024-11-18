import { Role, Status, TypeUser } from './../utils/Common/enum';
import * as mongoose from "mongoose"
const bcrypt = require('bcrypt')
const crypto = require('crypto')

    // Declare the Schema of the Mongo model
    var userSchema = new mongoose.Schema({
        username:{
            type:String,
            required:true,
        },
        dob:{
            type:String,
        },
        email:{
            type:String,
            required:true,
            unique:true,
        },
        images:{
            type:String,
        },
        gender:{
            type:String,
            enum:['Male', 'Female', 'Other'],
            default:'Other',
        },
        phone:{
            type:String,
            unique:true,
        },
        password:{
            type:String,
        },
        role: {
            type: String,
            enum: Role,
            default: Role.ROLE_USER
        },
        address: String,
        isBlocked:{
            type: Boolean,
            default: false,
        },
        refreshToken:{
            type: String,
        },
        passwordChangedAt:{
            type:String,
        },
        otp: {
            type: String,
        },
        otpExpire: {
            type: Date,
        },
        isActive:{
            type: Boolean,
            default: false,
        },
        type:{
            type:String,
            enum: TypeUser,
            default: TypeUser.USER,
        },
        organizerRequest :{
            type: String,
            enum: Status,
            default: null,
        },
        organizerRef:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organizer',
        }   
    },{
        timestamps: true,
    });

//Hash password
userSchema.pre('save', async function(next: any){
    if(!this.isModified('password')){
        next()
    }
    
    const salt = bcrypt.genSaltSync(10)
    this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods = {
    //Check password
    isCorrectPassword: async function(password: string){
        return await bcrypt.compare(password, this.password)
    },
    //ResetTokenPassword
    createPasswordChangeToken: function(email: string){
        const resetToken = crypto.randomBytes(32).toString('hex')
        this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        this.passwordResetExpire = Date.now() + 15 * 60 * 1000
        return resetToken 
    },
     // Create OTP for email verification or password reset
     createOtp: function () {
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
        this.otp = crypto.createHash('sha256').update(otp).digest('hex');
        this.otpExpire = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
        return otp;
    },
    verifyOtp: function (inputOtp: string) {
        const hashedOtp = crypto.createHash('sha256').update(inputOtp).digest('hex');
        return this.otp === hashedOtp && this.otpExpire > Date.now();
    }
} 

//Export the model
module.exports = mongoose.model('User', userSchema);