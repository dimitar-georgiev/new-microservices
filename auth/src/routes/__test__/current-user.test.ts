import request from 'supertest';
import {app} from '../../app';

it('returns current user', async () => {
    const authResponse = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@mail.bg',
            password: 'test'
        })
        .expect(201);

    const cookie = authResponse.get('Set-Cookie');

    const response = await request(app)
        .get('/api/users/currentuser')
        .set('Cookie', cookie)
        .send()
        .expect(200);

    expect(response.body.currentUser.email).toEqual('test@mail.bg');
});

it(`returns null if not authenticated`, async () => {
    const response = await request(app)
        .get('/api/users/currentuser')
        .send()
        .expect(200);
});