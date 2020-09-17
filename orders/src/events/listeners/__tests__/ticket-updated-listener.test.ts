import { TicketUpdatedEvent } from '@sandeepchugh/common';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async () => {
    // create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // create a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10
    });
    await ticket.save();

    // create a fake data event
    const data: TicketUpdatedEvent['data'] = {
        version: ticket.version+1,
        id: ticket.id,
        title: 'New concert',
        price: 999,
        userId: new mongoose.Types.ObjectId().toHexString()
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };
    return { listener, data, msg, ticket };
}

it('updates and saves a ticket', async () => {
    const { listener, data, msg, ticket } = await setup();
    // call the onMessage function
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('acknowledges the message', async () => {
    const { listener, data, msg } = await setup();
    // call the onMessage function
    await listener.onMessage(data, msg);
    // assertions
    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event skipped a version', async () => {
    const { listener, data, msg, ticket } = await setup();

    data.version = 10;

    // call the onMessage function
    try{
        await listener.onMessage(data, msg);
    } catch(err) {}
    // assertions
    expect(msg.ack).not.toHaveBeenCalled();
});