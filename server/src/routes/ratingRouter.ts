import express from 'express'
const router = express.Router()
const ctrls = require('../controller/ratingController')
const { verifyAccessToken } = require('../middlewares/verifyToken')

router.post('/:eventId', [verifyAccessToken], ctrls.rateEvent)
router.get('/:eventId', ctrls.listRate)

module.exports = router