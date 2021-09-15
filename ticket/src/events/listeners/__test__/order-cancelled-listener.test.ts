import {Message} from 'node-nats-streaming';

import {OrderCancelledListener} from '../order-cancelled-listener';
import {natsWrapper} from '../../../nats-wrapper';
import {Ticket} from '../../../models/ticket';
import {createMongoObjectId, OrderCancelledEvent} from '@micsrv/common';

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = createMongoObjectId();

    const ticket = Ticket.build({
        title: 'Ticket',
        price: 77,
        userId: createMongoObjectId()
    });
    ticket.set({ orderId });
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {id: ticket.id}
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return {listener, ticket, data, msg};
};

it('update the ticket, publish event and ack() the message', async () => {
    const {listener, ticket, data, msg} = await setup();

    expect(ticket.orderId).toBeDefined();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toBeUndefined();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    expect(msg.ack).toHaveBeenCalled();
});

it('', async () => {});
it('', async () => {});