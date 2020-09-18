import { ExpirationCompleteEvent, OrderStatus } from '@sandeepchugh/common';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/orders';

const setup = async () => {
    jest.clearAllMocks();
    // create an instance of the listener
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price: 20,
        title: 'concert'
    });

    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        userId: mongoose.Types.ObjectId().toHexString(),
        expiresAt: new Date(),
        ticket: ticket
    });
    await order.save();
    
    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };
    return { listener, data, msg, order,ticket };
}

it('updates the order status to cancelled', async () => {
    const { listener, data, msg, order, ticket } = await setup();
    // call the onMessage function
    await listener.onMessage(data, msg);
    // assertions
    const updatedOrder = await Order.findById(data.orderId);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acknowledges the message', async () => {
    const { listener, data, msg, order, ticket } = await setup();
    // call the onMessage function
    await listener.onMessage(data, msg);
    // assertions
    expect(msg.ack).toHaveBeenCalled()
});

it('emits an order cancelled event', async () => {
    const { listener, data, msg, order } = await setup();
    // call the onMessage function
    await listener.onMessage(data, msg);
    // assertions
    expect(natsWrapper.client.publish).toHaveBeenCalled()

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(eventData.id).toEqual(order.id);
});