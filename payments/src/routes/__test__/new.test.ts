import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/orders';
import { natsWrapper } from '../../nats-wrapper';
import mongoose, { mongo } from 'mongoose';
import { Payment } from '../../models/payment';
import { stripe } from '../../stripe';

it('has a route handler listening to /api/payments for post requests', async () => {
    const response = await request(app)
        .post('/api/payments')
        .send({});

    expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
    await request(app)
        .post('/api/payments')
        .send({})
        .expect(401);
});

it('returns a 404 when purchasing an order that does not exist', async () => {

    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'abcd',
            orderId: mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user ', async () => {
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price: 100,
        status: OrderStatus.Created,
        userId: mongoose.Types.ObjectId().toHexString(),
        version: 0
    });
    await order.save();
    
    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'abcd',
            orderId: order.id
        })
        .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = mongoose.Types.ObjectId().toHexString()
    
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price: 100,
        status: OrderStatus.Cancelled,
        userId: userId,
        version: 0
    });
    await order.save();
    
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId) )
        .send({
            token: 'abcd',
            orderId: order.id
        })
        .expect(400);
});

it('returns a 201 with valid inputs', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
      id: mongoose.Types.ObjectId().toHexString(),
      userId,
      version: 0,
      price,
      status: OrderStatus.Created,
    });
    await order.save();
  
    await request(app)
      .post('/api/payments')
      .set('Cookie', global.signin(userId))
      .send({
        token: 'tok_visa',
        orderId: order.id,
      })
      .expect(201);
  
    // const stripeCharges = await stripe.charges.list({ limit: 50 });
    // const stripeCharge = stripeCharges.data.find((charge) => {
    //   return charge.amount === price * 100;
    // });
  
    // expect(stripeCharge).toBeDefined();
    // expect(stripeCharge!.currency).toEqual('usd');
  
    // const payment = await Payment.findOne({
    //   orderId: order.id,
    //   stripeId: '123',
    // });
    // expect(payment).not.toBeNull();
  });

