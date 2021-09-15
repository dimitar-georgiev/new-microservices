import request from 'supertest';
import {app} from '../../app';

it(`clears the cookie after signout`, async () => {
    const loginResponse = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@mail.bg',
            password: 'test'
        })
        .expect(201);

    expect(loginResponse.get('Set-Cookie')).toBeDefined();

    const logoutResponse = await request(app)
        .post('/api/users/signout')
        .send({})
        .expect(200);

    expect(logoutResponse.get('Set-Cookie')).toBeDefined();
});