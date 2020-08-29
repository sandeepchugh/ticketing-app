import request from 'supertest';
import { app } from '../../app';

it('it fails when the email does not exist', async () => {
    await request(app)
    .post('/api/users/signin')
    .send({
        email: "test@test.com",
        password: "password"        
    })
    .expect(400);
});

it('fails when an incorrect password is supplied', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({
        email: "test1@test.com",
        password: "password1"        
    })
    .expect(201);
    
    await request(app)
        .post('/api/users/signin')
        .send({
            email: "test1@test.com",
            password: "password"        
        })
        .expect(400);
});


it('returns a cookie on successful signin', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({
        email: "test@test.com",
        password: "password"        
    })
    .expect(201);
    
    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: "test@test.com",
            password: "password"        
        })
        .expect(200);
    
    expect(response.get('Set-Cookie')).toBeDefined();
});

it('returns a 400 with an invalid email', async () => {
    return request(app)
        .post('/api/users/signin')
        .send({
            email: "testtestcom",
            password: "password"        
        })
        .expect(400);
});

it('returns a 400 with an invalid password', async () => {
    return request(app)
        .post('/api/users/signin')
        .send({
            email: "test@test.com",
            password: "p"        
        })
        .expect(400);
});

it('returns a 400 with a missing email and password', async () => {
    return request(app)
        .post('/api/users/signin')
        .send({})
        .expect(400);
});