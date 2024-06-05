import express from "express"
const ctrls = require('../controller/seatController')
const router = express.Router()
const { verifyAccessToken, isAdmin, isOrganizer} = require('../middlewares/verifyToken')


router.post('/',[verifyAccessToken], ctrls.createSeat)
router.get('/:sid',[verifyAccessToken], ctrls.getSeat)
router.put('/:sid',[verifyAccessToken], ctrls.updateSeat)


module.exports = router