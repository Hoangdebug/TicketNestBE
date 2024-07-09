import express from "express"
const ctrls = require('../controller/userController')
const router = express.Router()
const { verifyAccessToken, isAdmin, isOrganizer} = require('../middlewares/verifyToken')
const uploader = require('../config/cloudinary.config')

router.post('/register', ctrls.register)
router.post('/login', ctrls.login)
router.post('/be-organizer', verifyAccessToken, ctrls.userRequestOrganizer)
router.get('/current', verifyAccessToken, ctrls.getCurrent)
router.put('/refreshtoken', ctrls.refreshAccessToken)
router.get('/logout', ctrls.logout)
router.get('/forgotpassword', ctrls.forgotPassword)
router.put('/resetpassword', ctrls.resetPassword)
router.get('/', [verifyAccessToken, isAdmin] , ctrls.getAllUser)
router.put('/current', [verifyAccessToken] , ctrls.updateUser)
//getuserbyid
router.post('/create-account-by-admin',[verifyAccessToken, isAdmin], ctrls.createAccountbyAdmin)
router.put('/:id', [verifyAccessToken, isAdmin] , ctrls.updateUserbyAdmin)
router.put('/ban/:uid',[verifyAccessToken, isAdmin] ,ctrls.banUserByAdmin)
router.put('/role/:uid',[verifyAccessToken, isAdmin] , ctrls.organizerPermitByAdmin)
router.put('uploadimage/:id',[verifyAccessToken], uploader.array('images', 10), ctrls.uploadImage)
module.exports = router