import request from 'supertest';

import {app} from '../../app';
import {Ticket} from '../../models/ticket';
import {mockSignin} from '@micsrv/common';
import {natsWrapper} from '../../nats-wrapper';

it('listens on /api/tickets for POST requests', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});

    expect(response.status).not.toEqual(404);
});

it('allows only signed in users', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', mockSignin())
        .send({});

    expect(response.status).not.toEqual(401);
});

it('returns an error if invalid title', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', mockSignin())
        .send({title: '', price: 77})
        .expect(400);
    
    await request(app)
        .post('/api/tickets')
        .set('Cookie', mockSignin())
        .send({price: 77})
        .expect(400);
});

it('returns an error if invalid price', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', mockSignin())
        .send({title: 'ticket', price: -20})
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', mockSignin())
        .send({title: 'ticket'})
        .expect(400);
});

it('creates ticket with valid inputs', async () => {
    let tickets = await Ticket.find({});

    expect(tickets.length).toEqual(0);
    
    const title = 'ticket';
    const price = 77;

    await request(app)
        .post('/api/tickets')
        .set('Cookie', mockSignin())
        .send({
            title,
            price
        })
        .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual(title);
    expect(tickets[0].price).toEqual(price);
});

it('publishes an event', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', mockSignin())
        .send({
            title: 'ticket',
            price: 77
        })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});