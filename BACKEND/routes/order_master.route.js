import express from "express"
const router = express.Router();
import {Order_master,AllOrder,changeOrderStatusByAdmin,deleteOrder,cancelOrder,returnOrderByUser,getAllItemsAdmin,getAllOrderByAdmin,getAllItemsByCountAdmin} from "../controllers/Order_master.controller.js"
import {auth,adminOnly} from "../middlewares/auth.middleware.js"

router.post('/order',auth,Order_master)
router.get('/order',auth,AllOrder)
router.patch('/order/changeStatus/:id', auth, adminOnly, changeOrderStatusByAdmin)
router.delete('/order/deleteOrder/:id', auth, adminOnly, deleteOrder)
router.delete('/order/cancelOrder/:id',auth,cancelOrder)
router.patch('/order/returnOrder/:id',auth,returnOrderByUser)
router.get('/allOrder', auth, adminOnly, getAllOrderByAdmin)
router.get('/allItemsbyCount', auth, adminOnly, getAllItemsByCountAdmin)
router.get('/allItems', auth, adminOnly, getAllItemsAdmin)


export default router;
