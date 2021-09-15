import {Message} from 'node-nats-streaming';

import {natsWrapper} from '../../../nats-wrapper';
import {OrderCreatedListener} from '../order-created-listener';
import {OrderCreatedEvent, createMongoObjectId, OrderStatus} from '@micsrv/common';
import {Order} from '../../../models/order';

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const data: OrderCreatedEvent['data'] = {
        id: createMongoObjectId(),
        expiresAt: '123',
        status: OrderStatus.Created,
        userId: createMongoObjectId(),
        version: 0,
        ticket: {
            id: createMongoObjectId(),
            price: 77
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, msg};
};

it('replicates the order info', async () => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);

    expect(order!.price).toEqual(data.ticket.price);
});

it('ack the message', async () => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});


