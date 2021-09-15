import request from 'supertest';

import {app} from '../../app';
import {mockSignin, createMongoObjectId} from '@micsrv/common';
import {natsWrapper} from '../../nats-wrapper';
import {Ticket} from '../../models/ticket';

it('returns 404 if id not exists', async () => {
    await request(app)
        .put(`/api/tickets/${createMongoObjectId()}`)
        .set('Cookie', mockSignin())
        .send({title: 'ticket', price: 77})
        .expect(404);
});

it('returns 401 if user not authenticated', async () => {
    await request(app)
        .put(`/api/tickets/${createMongoObjectId}`)
        .send({title: 'ticket', price: 77})
        .expect(401);
});

it('returns 401 if user doesn\'t own the ticket', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', mockSignin())
        .send({title: 'ticket_1', price: 77})
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', mockSignin())
        .send({title: 'ticket_updated', price: 177})
        .expect(401);
});

it('returns 400 if invalid inputs', async () => {
    const cookie = mockSignin();
    
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({title: 'ticket_1', price: 77})
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({title: '', price: 77})
        .expect(400);
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({title: 'ticket_updated', price: -11})
        .expect(400);
});

it('rejects updates if ticket is reserved', async () => {
    const cookie = mockSignin();

    const ticket = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Ticket',
            price: 77
        })
        .expect(201);

    const fetchedTicket = await Ticket.findById(ticket.body.id);
    fetchedTicket!.set({orderId: createMongoObjectId()});
    await fetchedTicket!.save();

    const editReservedTicket = await request(app)
        .put(`/api/tickets/${ticket.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Reserved_Ticket',
            price: 177
        })
        .expect(400);

    expect(editReservedTicket.body.errors[0].message).toEqual('Cannot edit reserved ticket.');
});

it('updates ticket with valid inputs', async () => {
    const cookie = mockSignin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({title: 'ticket', price: 77})
        .expect(201);

    const newTitle = 'ticket_updated';
    const newPrice = 177;

    const updateResponse = await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({title: newTitle, price: newPrice})
        .expect(201);

    // expect(updateResponse.body.id).toEqual(response.body.id);
    // expect(updateResponse.body.title).toEqual(newTitle);

    const getTicketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);

    expect(getTicketResponse.body.title).toEqual(newTitle);
    expect(getTicketResponse.body.price).toEqual(newPrice);
});

it('publishes an event', async () => {
    const cookie = mockSignin();
    
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({title: 'ticket', price: 77})
        .expect(201);

    const newTitle = 'ticket_updated';
    const newPrice = 177;

    const updateResponse = await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({title: newTitle, price: newPrice})
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});