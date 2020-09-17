import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';


it('returns a 404 if the provided ticket id does not exist', async () =>  {
    const id = new mongoose.Types.ObjectId().toHexString();
    
    await request(app)
        .get(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'Movie2',
            price: '20'
        })
        .expect(404);
    
});

it('returns a 401 if the user is not authenticated', async () =>  {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'Movie2',
            price: '20'
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .send({
            title: 'Movie21',
            price: '19'
        })
        .expect(401);
    
});

it('returns a 401 if the user does not own the ticket', async () =>  {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'Movie2',
            price: '20'
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'Movie21',
            price: '19'
        })
        .expect(401);
    
});

it('returns a 400 if the user provides an invalid title or price', async () =>  {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Movie2',
            price: '20'
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: '20'
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Movie4',
            price: '-20'
        })
        .expect(400);
    
});

it('updates the ticket if valid input is provided', async () =>  {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Movie2',
            price: '20'
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Movie3',
            price: '18'
        })
        .expect(200);
    
    const getResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);

    expect(getResponse.body.title).toEqual('Movie3');
    expect(getResponse.body.price).toEqual('18');
    
});

it('publishes an event', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Movie2',
            price: '20'
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Movie3',
            price: '18'
        })
        .expect(200);
    
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});