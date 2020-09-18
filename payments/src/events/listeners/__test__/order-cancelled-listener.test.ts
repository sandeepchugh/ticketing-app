import { OrderCancelledEvent, OrderCreatedEvent, OrderStatus } from '@sandeepchugh/common';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Order } from '../../../models/orders';

const setup = async () => {
    jest.clearAllMocks();

    // create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);
    
    const orderId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: orderId,
        price: 99,
        status: OrderStatus.Created,
        version:0,
        userId: new mongoose.Types.ObjectId().toHexString()
    });
    await order.save();

    // create a fake data event
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 1,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString()
        }
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };
    return { listener, data, msg, orderId };
}

it('sets the order status as cancelled', async () => {
    const { listener, data, msg, orderId } = await setup();
    // call the onMessage function
    await listener.onMessage(data, msg);
    // assertions
    const updatedOrder = await Order.findById(orderId);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acknowledges the message', async () => {
    const { listener, data, msg } = await setup();
    // call the onMessage function
    await listener.onMessage(data, msg);
    // assertions
    expect(msg.ack).toHaveBeenCalled()
});

