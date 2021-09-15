import request from 'supertest';

import {app} from '../../app';
import {Ticket} from '../../models/ticket';
import {Order, OrderStatus} from '../../models/order';
import {mockSignin, createMongoObjectId} from '@micsrv/common';
import {natsWrapper} from '../../nats-wrapper';

it('cancel the order', async () => {
    const ticketId = createMongoObjectId();

    const ticket = Ticket.build({
        id: ticketId,
        title: 'New Ticket',
        price: 77
    });
    await ticket.save();

    const user = mockSignin();

    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id})
        .expect(201);

    expect(order.status).toEqual(OrderStatus.Created);

    const response = await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits order cancelled event', async () => {
    const ticketId = createMongoObjectId();

    const ticket = Ticket.build({
        id: ticketId,
        title: 'Ticket',
        price: 77
    });
    await ticket.save();

    const user = mockSignin();

    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({
            ticketId: ticket.id
        })
        .expect(201);

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});