import express from "express"
const ctrls = require('../controller/seatController')
const router = express.Router()
const { verifyAccessToken, isAdmin, isOrganizer} = require('../middlewares/verifyToken')

router.post('/', ctrls.createSeat);  // Không dùng middleware verifyAccessToken
router.get('/:sid', [verifyAccessToken], ctrls.getSeat);
router.put('/:sid', [verifyAccessToken], ctrls.updateSeat);
router.put('/update-status/:eid', [verifyAccessToken, isAdmin], ctrls.updateSeatStatus);

module.exports = router;
