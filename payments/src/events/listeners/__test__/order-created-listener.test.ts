import { OrderCreatedEvent, OrderStatus } from '@sandeepchugh/common';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/orders';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async () => {
    jest.clearAllMocks();

    // create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // create a fake data event
    const data: OrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        expiresAt: new Date().toISOString(),
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        ticket: {
            id: mongoose.Types.ObjectId().toHexString(),
            price: 99
        }
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };
    return { listener, data, msg };
}

it('creates an order', async () => {
    const { listener, data, msg } = await setup();
    // call the onMessage function
    await listener.onMessage(data, msg);
    // assertions
    const order = await Order.findById(data.id);
    expect(order!.id).toEqual(data.id);
    expect(order!.price).toEqual(data.ticket.price);
    
});

it('acknowledges the message', async () => {
    const { listener, data, msg } = await setup();
    // call the onMessage function
    await listener.onMessage(data, msg);
    // assertions
    expect(msg.ack).toHaveBeenCalled()
});
