import express from 'express'
const router = express.Router()
const ctrls = require('../controller/orderController')
const { verifyAccessToken, isAdmin, isOrganizer} = require('../middlewares/verifyToken')

router.get('/payment-return', ctrls.captureOrder);
router.post('/:eid', ctrls.createOrder);
router.get('/:id', ctrls.getOrder);
router.get('/', verifyAccessToken, ctrls.getOrderList);
router.put('/:id', ctrls.updateOrder); 
router.delete('/:id', ctrls.deleteOrder);
router.post('/sendOrderEmail/:orderId', ctrls.sendOrderEmail);
module.exports = router