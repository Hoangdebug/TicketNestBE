import express from 'express'
import { createEvent, getAllEvents, getAllEventsWithPagination, getEventByOrganizer, readEvent, staticEventFollowByMonth, updateEvent } from '~/controller/eventController';
const router = express.Router()
const { verifyAccessToken, isAdmin, isOrganizer } = require('../middlewares/verifyToken')
const ctrls = require('../controller/eventController')

router.post('/', [verifyAccessToken], createEvent);
router.get('/all', getAllEvents)
router.get('/get-event', [verifyAccessToken, isOrganizer], getEventByOrganizer);
router.get('/statistic/event', [verifyAccessToken, isOrganizer], staticEventFollowByMonth);
router.get('/:id', verifyAccessToken, readEvent);
router.put('/:id', [verifyAccessToken, isOrganizer], updateEvent);
router.get('/', getAllEventsWithPagination)
router.put('/update-status/:eid', [verifyAccessToken, isOrganizer], ctrls.updateEventsStatus);



// router.get('/statistic/:organizerId', [verifyAccessToken, isOrganizer], getTotalOrderByMonth);

module.exports = router