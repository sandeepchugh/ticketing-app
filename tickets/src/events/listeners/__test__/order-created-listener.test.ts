import { OrderCreatedEvent, OrderStatus } from '@sandeepchugh/common';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async () => {
    jest.clearAllMocks();

    // create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        title: 'concert',
        price: 99,
        userId: new mongoose.Types.ObjectId().toHexString()
    });

    await ticket.save();

    // create a fake data event
    const data: OrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        expiresAt: new Date().toISOString(),
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };
    return { listener, data, msg };
}

it('sets the user id of the ticket', async () => {
    const { listener, data, msg } = await setup();
    // call the onMessage function
    await listener.onMessage(data, msg);
    // assertions
    const updatedTicket = await Ticket.findById(data.ticket.id);
    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acknowledges the message', async () => {
    const { listener, data, msg } = await setup();
    // call the onMessage function
    await listener.onMessage(data, msg);
    // assertions
    expect(msg.ack).toHaveBeenCalled()
});

it('publishes a ticket updated event', async () => {
    const { listener, data, msg } = await setup();
    // call the onMessage function
    await listener.onMessage(data, msg);
    // assertions
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    console.log((natsWrapper.client.publish as jest.Mock).mock.calls)
    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(data.id).toEqual(ticketUpdatedData.orderId);
});