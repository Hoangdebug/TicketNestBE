import { NextFunction, Response, Request } from "express"
import { Role } from "~/utils/Common/enum";

const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

interface CustomRequest extends Request {
    user?: any; // Đặt kiểu dữ liệu phù hợp cho user ở đây
}

const verifyAccessToken = asyncHandler((req: CustomRequest, res: Response, next: NextFunction) => {
    if(req?.headers.authorization?.startsWith('Bearer')){
        const token = req.headers.authorization.split(' ')[1]
        jwt.verify(token, process.env.JWT_SECRET, (err: any, decode: any) => {
            if(err) return res.status(401).json({
                success: false,
                mes: 'Invalid access token'
            })     
            req.user = decode
            next()       
        })
    }else{
        return res.status(401).json({
            success: false,
            mes: 'Require authentication!!!!'
        })  
    }
})

const isAdmin = asyncHandler((req: CustomRequest, res: Response, next: NextFunction) => {
    const {role} = req.user
    if(!role.includes(Role.ROLE_ADMIN))
    return res.status(401).json({
        success: false,
        mes: 'Require admin authority to access this page'
    })
    next()
})

const isOrganizer = asyncHandler((req: CustomRequest, res: Response, next: NextFunction) => {
    const {role} = req.user
    if(!role.includes(Role.ROLE_ORGANIZER))
    return res.status(401).json({
        success: false,
        mes: 'Require organizer authority to access this page'
    })
    next()
})

module.exports = {
    verifyAccessToken,
    isAdmin,
    isOrganizer
}