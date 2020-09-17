import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/orders';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('marks the order as cancelled', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        id: mongoose.Types.ObjectId().toHexString()
    });

    await ticket.save(); 

    const user = global.signin();

    const { body: order} =  await request(app)
            .post('/api/orders')
            .set('Cookie', user)
            .send({ ticketId: ticket.id})
            .expect(201);

   await request(app)
            .delete(`/api/orders/${order.id}`)
            .set('Cookie', user)
            .expect(204);

    const cancelledOrder = await Order.findById(order.id);    
    expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        id: mongoose.Types.ObjectId().toHexString()
    });

    await ticket.save(); 

    const user = global.signin();

    const { body: order} =  await request(app)
            .post('/api/orders')
            .set('Cookie', user)
            .send({ ticketId: ticket.id})
            .expect(201);

   await request(app)
            .delete(`/api/orders/${order.id}`)
            .set('Cookie', user)
            .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});