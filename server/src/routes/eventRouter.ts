import express from 'express'
const router = express.Router()
const ctrls = require('../controller/eventController')
const { verifyAccessToken, isAdmin, isOrganizer} = require('../middlewares/verifyToken')

router.post('/', [verifyAccessToken] ,ctrls.createEvent);
router.get('/', ctrls.getAllEvents)
router.get('/:id', verifyAccessToken, ctrls.readEvent);
router.put('/:id',[verifyAccessToken, isOrganizer], ctrls.updateEvent);

router.get('/statistic/event', [verifyAccessToken, isOrganizer], ctrls.staticEventFollowByMonth);
// router.get('/statistic/:organizerId', [verifyAccessToken, isOrganizer], ctrls.getTotalOrderByMonth);

module.exports = router