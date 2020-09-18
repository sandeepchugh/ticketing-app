import { Message } from 'node-nats-streaming';
import { Subjects, Listener, PaymentCreatedEvent, OrderStatus } from '@sandeepchugh/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/orders';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject= Subjects.PaymentCreated;
    queueGroupName= queueGroupName;
    
    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const { orderId, stripeId } = data;
        const order = await Order.findById(orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        order.set({status: OrderStatus.Complete});

        await order.save();

        msg.ack();
    }

}