import {Message} from 'node-nats-streaming';

import {OrderCancelledListener} from '../order-cancelled-listener';
import {natsWrapper} from '../../../nats-wrapper';
import {OrderCancelledEvent, createMongoObjectId, OrderStatus} from '@micsrv/common';
import {Order} from '../../../models/order';

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: createMongoObjectId(),
        price: 77,
        status: OrderStatus.Created,
        version: 0,
        userId: createMongoObjectId()
    });
    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: createMongoObjectId()
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, msg, order};
};

it('updates the status of the order', async () => {
    const {listener, data, msg, order} = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('ack the message', async () => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

// it('', async () => {});
// it('', async () => {});
// it('', async () => {});