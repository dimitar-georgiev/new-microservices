import {Message} from 'node-nats-streaming';

import {ExpirationCompleteListener} from '../expiration-complete-listener';
import {natsWrapper} from '../../../nats-wrapper';
import {Order, OrderStatus} from '../../../models/order';
import {Ticket} from '../../../models/ticket';
import {createMongoObjectId, ExpirationCompleteEvent} from '@micsrv/common';

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: createMongoObjectId(),
        title: 'Ticket',
        price: 77
    });
    await ticket.save();

    const order = Order.build({
        userId: createMongoObjectId(),
        expiresAt: new Date(),
        status: OrderStatus.Created,
        ticket
    });
    await order.save();

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return {listener, ticket, order, data, msg};
};

it('updates the order status to cancelled', async () => {
    const {listener, order, data, msg} = await setup();

    await listener.onMessage(data, msg);

    const fetchedOrder = await Order.findById(order.id);

    expect(fetchedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit an OrderCancelled event', async () => {
    const {listener, order, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = (natsWrapper.client.publish as jest.Mock).mock.calls[0][1];

    expect(JSON.parse(eventData).id).toEqual(order.id);
});

it('ack the message', async () => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

// it('', async () => {});
// it('', async () => {});