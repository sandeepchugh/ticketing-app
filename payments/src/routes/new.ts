import express, {Request, Response} from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, BadRequestError,NotFoundError, NotAuthorizedError, OrderStatus } from '@sandeepchugh/common';
import { Order } from '../models/orders';
import { natsWrapper } from '../nats-wrapper';
import { stripe } from '../stripe';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import mongoose from 'mongoose';
import { Payment } from '../models/payment';

const router = express.Router();

router.post('/api/payments', requireAuth, [
    body('token')
        .not()
        .isEmpty(),
    body('orderId')
        .not()
        .isEmpty()
],validateRequest, async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if(!order) {
        throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id){
        throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
        throw new BadRequestError('Cannot pay for a cancelled order');
    }

    // await stripe.charges.create({
    //     currency: 'usd',
    //     amount: order.price *100,
    //     source: token
    // });

    // NOTE: stripe integration is pending. Create a stripe account and uncomment the code above
    // comment the line below and use the id from stripe
    const stripeId = mongoose.Types.ObjectId().toHexString();

    const payment = Payment.build({
        orderId,
        stripeId
    });
    await payment.save();

    new PaymentCreatedPublisher(natsWrapper.client).publish({
        id: payment.id,
        stripeId: payment.stripeId,
        orderId: payment.orderId
    });

    res.status(201).send({success: true});
});

export {router as createChargeRouter }