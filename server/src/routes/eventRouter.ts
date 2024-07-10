import express from 'express'
const ctrls = require('../controller/eventController')
const router = express.Router()
const { verifyAccessToken, isAdmin, isOrganizer } = require('../middlewares/verifyToken')
const uploader = require('../config/cloudinary.config')


router.post('/', [verifyAccessToken], ctrls.createEvent);
router.get('/all', ctrls.getAllEvents)
router.get('/get-event', [verifyAccessToken, isOrganizer], ctrls.getEventByOrganizer);
router.get('/statistic/event', [verifyAccessToken, isOrganizer], ctrls.staticEventFollowByMonth);
router.get('/:id', verifyAccessToken, ctrls.readEvent);
router.put('/:id', [verifyAccessToken, isOrganizer], ctrls.updateEvent);
router.get('/', ctrls.getAllEventsWithPagination)
router.put('/uploadimage/:id',[verifyAccessToken], uploader.array('images', 10), ctrls.uploadImage)


// router.get('/statistic/:organizerId', [verifyAccessToken, isOrganizer], getTotalOrderByMonth);

module.exports = router