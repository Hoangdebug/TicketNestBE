import express from 'express'
const router = express.Router()
const ctrls = require('../controller/adminController')
const { verifyAccessToken, isAdmin, } = require('../middlewares/verifyToken')

router.get('/statistic/event', [verifyAccessToken, isAdmin], ctrls.staticEventByAdmin)
router.get('/statistic/order', [verifyAccessToken, isAdmin], ctrls.totalPriceOrderInMonth)
router.get('/approveOrganizer/:Userid', ctrls.approveOrganizer)
module.exports = router