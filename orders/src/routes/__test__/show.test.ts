import request from 'supertest';

import {app} from '../../app';
import {Ticket} from '../../models/ticket';
import {mockSignin, createMongoObjectId} from '@micsrv/common';

it('fetches the order', async () => {
    const ticketId = createMongoObjectId();

    const ticket = Ticket.build({
        id: ticketId,
        title: 'First Ticket',
        price: 77
    });
    await ticket.save();

    const user = mockSignin();

    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    const {body: fetchedOrder} = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);    

    expect(fetchedOrder.id).toEqual(order.id);
});


it('returns error if user tries to fetch another user order', async () => {
    const ticketId = createMongoObjectId();

    const ticket = Ticket.build({
        id: ticketId,
        title: 'Second Ticket',
        price: 177
    });
    await ticket.save();

    const owner = mockSignin();
    const not_owner = mockSignin();

    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', owner)
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', owner)
        .send()
        .expect(200);

    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', not_owner)
        .send()
        .expect(401);
});