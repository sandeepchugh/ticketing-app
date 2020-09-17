import { OrderCancelledEvent, OrderCreatedEvent, OrderStatus } from '@sandeepchugh/common';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
    jest.clearAllMocks();

    // create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);
    
    const orderId = new mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
        title: 'concert',
        price: 99,
        userId: new mongoose.Types.ObjectId().toHexString()
    });
    ticket.set({ orderId })
    await ticket.save();

    // create a fake data event
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };
    return { listener, data, msg, orderId, ticket };
}

it('sets the user id of the ticket', async () => {
    const { listener, data, msg } = await setup();
    // call the onMessage function
    await listener.onMessage(data, msg);
    // assertions
    const updatedTicket = await Ticket.findById(data.ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined();
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

    expect(ticketUpdatedData.orderId).not.toBeDefined();
});