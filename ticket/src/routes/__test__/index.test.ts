import request from 'supertest';

import {app} from '../../app';
import {mockSignin} from '@micsrv/common';

it('fetches a list of tickets', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', mockSignin())
        .send({title: 'ticket_1', price: 77})
        .expect(201);
    
    await request(app)
        .post('/api/tickets')
        .set('Cookie', mockSignin())
        .send({title: 'ticket_2', price: 111})
        .expect(201);

    const response = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200);

    expect(response.body.length).toEqual(2);
    expect(response.body[0].title).toEqual('ticket_1');
});