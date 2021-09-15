import request from 'supertest';

import {app} from '../../app';
import {mockSignin, createMongoObjectId} from '@micsrv/common';
import {Order, OrderStatus} from '../../models/order';
import {Ticket} from '../../models/ticket';
import {natsWrapper} from '../../nats-wrapper';

it('returns error if ticket not exists', async () => {
    const ticketId = createMongoObjectId();
    
    await request(app)
        .post('/api/orders')
        .set('Cookie', mockSignin())
        .send({ ticketId })
        .expect(404);
});

it('returns error if ticket reserved', async () => {
    const ticketId = createMongoObjectId();

    const ticket = Ticket.build({
        id: ticketId,
        title: 'First Ticket',
        price: 77
    });
    await ticket.save();

    const order = Order.build({
        userId: 'df54dsfs77',
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket
    });
    await order.save();

    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', mockSignin())
        .send({ ticketId: ticket.id })
        .expect(400);

    expect(response.body.errors[0].message).toEqual('Ticket is already reserved.');
});

it('reserves the ticket', async () => {
    const ticketId = createMongoObjectId();

    const ticket = Ticket.build({
        id: ticketId,
        title: 'Second Ticket',
        price: 177
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', mockSignin())
        .send({ ticketId: ticket.id })
        .expect(201);
});

it('emits an order created event', async () => {
    const ticketId = createMongoObjectId();

    const ticket = Ticket.build({
        id: ticketId,
        title: 'Ticket',
        price: 77
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', mockSignin())
        .send({ ticketId: ticket.id })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});