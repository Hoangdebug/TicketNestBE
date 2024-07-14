import express from "express"
const ctrls = require('../controller/userController')
const router = express.Router()
const { verifyAccessToken, isAdmin, isOrganizer} = require('../middlewares/verifyToken')
const uploadCloud = require('../config/cloudinary.config')

router.post('/register', ctrls.register)
router.post('/verify-register/:email', ctrls.verifyOtp)
router.post('/login', ctrls.login)
router.post('/be-organizer', verifyAccessToken, ctrls.userRequestOrganizer)
router.get('/current', verifyAccessToken, ctrls.getCurrent)
router.put('/refreshtoken', ctrls.refreshAccessToken)
router.get('/logout', ctrls.logout)
router.post('/forgotpassword', ctrls.forgotPassword)
router.post('/verify-forgot-pass/:email', ctrls.verifyOtpAndResetPassword)
router.get('/', [verifyAccessToken, isAdmin] , ctrls.getAllUser)
router.put('/current', [verifyAccessToken] , ctrls.updateUser)
router.put('/upload-image', [verifyAccessToken], uploadCloud.single('images'), ctrls.uploadImage);
//getuserbyid
router.post('/create-account-by-admin',[verifyAccessToken, isAdmin], ctrls.createAccountbyAdmin)
router.put('/:id', [verifyAccessToken, isAdmin] , ctrls.updateUserbyAdmin)
router.put('/ban/:uid',[verifyAccessToken, isAdmin] ,ctrls.banUserByAdmin)
router.put('/role/:uid',[verifyAccessToken, isAdmin] , ctrls.organizerPermitByAdmin)
module.exports = router