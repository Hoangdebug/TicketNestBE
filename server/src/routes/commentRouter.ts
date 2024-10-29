import express from 'express'
const router = express.Router()
const ctrls = require('../controller/commentController')
const { verifyAccessToken } = require('../middlewares/verifyToken')

router.post('/:eid', [verifyAccessToken], ctrls.createComment)
router.get('/:eid', [verifyAccessToken], ctrls.getListCommentByIdEvent)
router.post('/reply/:eid/:idComment', [verifyAccessToken], ctrls.replyComment)
router.get('/reply/:eid/:idComment', [verifyAccessToken], ctrls.getListCommentById)

module.exports = router