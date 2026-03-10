import express from "express"
const orderRouter = express.Router();
<<<<<<< HEAD
import {Order_master,AllOrder,changeOrderStatusByAdmin,deleteOrder,cancelOrder,returnOrderByUser,getAllItemsAdmin,getAllOrderByAdmin,getAllItemsByCountAdmin,getOrderSummery} from "../controllers/Order_master.controller.js"
=======
import {Order_master,AllOrder,changeOrderStatusByAdmin,deleteOrder,cancelOrder,returnOrderByUser,getAllItemsAdmin,getAllOrderByAdmin,getAllItemsByCountAdmin,getAdminOrdersPaginated,getAdminOrderDetail,updatePaymentStatusByAdmin} from "../controllers/Order_master.controller.js"
>>>>>>> 4a177b41b3db1e45014a0d94b9dad3a581de7d4e
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

// New admin endpoints — paginated orders with full details
orderRouter.get('/admin/orders', auth, adminOnly, getAdminOrdersPaginated)
orderRouter.get('/admin/orders/:id', auth, adminOnly, getAdminOrderDetail)
orderRouter.patch('/admin/orders/:id/payment-status', auth, adminOnly, updatePaymentStatusByAdmin)


export default orderRouter;
