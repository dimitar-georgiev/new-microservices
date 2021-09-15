import request from 'supertest';
import mongoose from 'mongoose';

import {app} from '../../app';
import {mockSignin} from '@micsrv/common';
import {createMongoObjectId} from '@micsrv/common';

it('returns 404 if ticket not found', async () => {

    await request(app)
        .get(`/api/tickets/${createMongoObjectId()}`)
        .send({title: 'ticket', price: 77})
        .expect(404);
});

it('returns ticket if found', async () => {
    const title = 'ticket';
    const price = 107;
    
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', mockSignin())
        .send({title, price})
        .expect(201);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
});