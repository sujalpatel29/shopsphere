import express from "express"
const orderRouter = express.Router();
import {Order_master,AllOrder,changeOrderStatusByAdmin,deleteOrder,cancelOrder,returnOrderByUser,getAllItemsAdmin,getAllOrderByAdmin,getAllItemsByCountAdmin,getOrderSummery} from "../controllers/Order_master.controller.js"
import {auth,adminOnly} from "../middlewares/auth.middleware.js"

orderRouter.post('/make-order',auth,Order_master)
orderRouter.get('/user-allorder',auth,AllOrder)
orderRouter.get('/order-summery',auth,getOrderSummery)
orderRouter.patch('/changestatus/:id', auth, adminOnly, changeOrderStatusByAdmin)
orderRouter.delete('/deleteorder/:id', auth, adminOnly, deleteOrder)
orderRouter.delete('/cancelorder/:id',auth,cancelOrder)
orderRouter.patch('/returnorder/:id',auth,returnOrderByUser)
orderRouter.get('/allorder', auth, adminOnly, getAllOrderByAdmin)
orderRouter.get('/all-itemsby-count', auth, adminOnly, getAllItemsByCountAdmin)
orderRouter.get('/all-items', auth, adminOnly, getAllItemsAdmin)


export default orderRouter;
