import express from "express"
const orderItemRouter = express.Router();
import {  getAllOrderItem,getOneItem} from "../controllers/Order_item.controller.js";
import {auth} from "../middlewares/auth.middleware.js"


orderItemRouter.get('/:orderId/items',auth,getAllOrderItem)
orderItemRouter.get('/:orderId/items/:itemId',auth,getOneItem)

export default orderItemRouter;