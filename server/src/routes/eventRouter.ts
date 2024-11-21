import express from 'express'
const ctrls = require('../controller/eventController')
const router = express.Router()
const { verifyAccessToken, isAdmin, isOrganizer } = require('../middlewares/verifyToken')
const uploadCloud = require('../config/cloudinary.config')

router.post('/', [verifyAccessToken], ctrls.createEvent);
router.get('/search', ctrls.searchEvents);
router.get('/all', ctrls.getAllEvents)
router.get('/get-event', [verifyAccessToken, isOrganizer], ctrls.getEventByOrganizer);
router.get('/statistic/event', [verifyAccessToken, isOrganizer], ctrls.staticEventFollowByMonth);
router.get('/', ctrls.getAllEventsWithPagination)
router.get('/:eid', ctrls.readEvent);
router.get('/location', ctrls.getLocation);
router.put('/:id', [verifyAccessToken, isOrganizer], ctrls.updateEvent);
router.put('/update-status/:eid', [verifyAccessToken, isAdmin], ctrls.updateEventsStatus);
router.put('/upload-image/:eventId',[verifyAccessToken], uploadCloud.single('images'), ctrls.uploadImage);



// router.get('/statistic/:organizerId', [verifyAccessToken, isOrganizer], getTotalOrderByMonth);

module.exports = router