import express from "express"
const ctrls = require('../controller/seatController')
const router = express.Router()
const { verifyAccessToken, isAdmin, isOrganizer} = require('../middlewares/verifyToken')

router.post('/', [verifyAccessToken], ctrls.createSeat);
router.get('/:sid', ctrls.getSeat);  
router.get('/event/:eventId', ctrls.getSeatByEventId);
router.put('/:sid', [verifyAccessToken], ctrls.updateSeat);
router.put('/update-status/:eid', [verifyAccessToken, isAdmin], ctrls.updateSeatStatus);
router.put('/update-order/:seatId', ctrls.updateOrderSeat);

module.exports = router;