import request from 'supertest';

import {app} from '../../app';
import {Ticket} from '../../models/ticket';
import {mockSignin, createMongoObjectId} from '@micsrv/common';

const createTicket = async () => {
    const ticketId = createMongoObjectId();

    const ticket = Ticket.build({
        id: ticketId,
        title: 'Ticket',
        price: 77
    });1
    await ticket.save();

    return ticket;
};

it('fetches orders for a particular user', async () => {
    const ticket_1 = await createTicket();
    const ticket_2 = await createTicket();
    const ticket_3 = await createTicket();

    const user_1 = mockSignin();
    const user_2 = mockSignin();

    // orders are supposed to be created directly through the Order model
    // this will requires us to create two separate ObjectId
    // for simplicity we are using the *new* route
    const order_1 = await request(app)
        .post('/api/orders')
        .set('Cookie', user_1)
        .send({ ticketId: ticket_1.id })
        .expect(201);
    
    const {body: order_2} = await request(app)
        .post('/api/orders')
        .set('Cookie', user_2)
        .send({ ticketId: ticket_2.id })
        .expect(201);
    
    const {body: order_3} = await request(app)
        .post('/api/orders')
        .set('Cookie', user_2)
        .send({ ticketId: ticket_3.id })
        .expect(201);

    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', user_2)
        .send({})
        .expect(200);

    // console.log(response.body);
    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(order_2.id);
    expect(response.body[1].id).toEqual(order_3.id);
    expect(response.body[0].ticket.id).toEqual(ticket_2.id);
    expect(response.body[1].ticket.id).toEqual(ticket_3.id);
});


it.todo('returns error if user try to fetch orders created by another users');