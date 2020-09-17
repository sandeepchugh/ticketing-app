import { NotAuthorizedError, NotFoundError, OrderStatus, requireAuth } from '@sandeepchugh/common';
import express, {Request, Response} from 'express';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { Order } from '../models/orders';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete('/api/orders/:orderId', requireAuth,
     async (req: Request, res: Response) => {
        
        const orderId = req.params.orderId;

        const order = await Order.findById(orderId).populate('ticket');

        if(!order){
            throw new NotFoundError();
        }

        if(order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        order.status = OrderStatus.Cancelled;

        order.save();

        new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            version: 1,
            ticket: {
                id: order.ticket.id
            }
        });

        res.status(204).send(order);
});

export {router as deleteOrderRouter }