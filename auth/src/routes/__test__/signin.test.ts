import request from 'supertest';
import {app} from '../../app';

it(`returns 400 if the email doesn't exist`, async () => {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'random@mail.bg',
            password: 'random'
        })
        .expect(400);
});

it(`returns 400 if invalid password supplied`, async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@mail.bg',
            password: 'test'
        })
        .expect(201);

    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@mail.bg',
            password: 'password'
        })
        .expect(400)
});

it(`responds with a cookie on successful login`, async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@mail.bg',
            password: 'test'
        })
        .expect(201);

    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@mail.bg',
            password: 'test'
        })
        .expect(200)

    expect(response.get('Set-Cookie')).toBeDefined();
});