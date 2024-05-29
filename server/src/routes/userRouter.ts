import express from "express"
const ctrls = require('../controller/userController')
const router = express.Router()
const { verifyAccessToken, isAdmin, isOrganizer} = require('../middlewares/verifyToken')
const uploader = require('../config/cloudinary.config')

router.post('/register', ctrls.register)
router.post('/login', ctrls.login)
router.get('/current', verifyAccessToken, ctrls.getCurrent)
router.put('/refreshtoken', ctrls.refreshAccessToken)
router.get('/logout', ctrls.logout)
router.get('/forgotpassword', ctrls.forgotPassword)
router.put('/resetpassword', ctrls.resetPassword)
router.get('/', [verifyAccessToken, isAdmin] , ctrls.getAllUser)
router.put('/current', [verifyAccessToken] , ctrls.updateUser)
router.put('/address', [verifyAccessToken] , ctrls.updateAddress)
//getuserbyid
router.put('/:uid', [verifyAccessToken, isAdmin] , ctrls.updateUserbyAdmin)
router.put('/ban/:uid',[verifyAccessToken, isAdmin] ,ctrls.banUserByAdmin)
router.put('uploadimage/:uid',[verifyAccessToken], uploader.array('images', 10), ctrls.uploadImage)
module.exports = router