import {Message} from 'node-nats-streaming';

import {OrderCreatedListener} from '../order-created-listener';
import {OrderCreatedEvent, createMongoObjectId, OrderStatus} from '@micsrv/common';
import {natsWrapper} from '../../../nats-wrapper';
import {Ticket} from '../../../models/ticket';

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        userId: createMongoObjectId(),
        title: 'Ticket',
        price: 77
    });
    await ticket.save();

    // Fake data
    const data: OrderCreatedEvent['data'] = {
        id: createMongoObjectId(),
        version: 0,
        expiresAt: new Date().toISOString(),
        status: OrderStatus.Created,
        userId: ticket.userId,
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    };

    // Fake message
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return {listener, ticket, data, msg};
};

it('sets the orderId of the ticket', async () => {
    const {listener, ticket, data, msg} = await setup();

    const ticketFromDB = await Ticket.findById(data.ticket.id);
    expect(ticketFromDB!.orderId).toEqual(undefined);
    expect(ticketFromDB!.version).toEqual(0);

    await listener.onMessage(data, msg);

    const ticketUpdated = await Ticket.findById(data.ticket.id);
    expect(ticketUpdated!.orderId).toEqual(data.id);
    expect(ticketUpdated!.version).toEqual(1);
});

it('ack the message', async () => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('publishes ticket updated event', async () => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    // //@ts-ignore
    // console.log(natsWrapper.client.publish.mock.calls[0][1]);

    // The same as the above
    const ticketDataJSON = (natsWrapper.client.publish as jest.Mock).mock.calls[0][1];

    expect(JSON.parse(ticketDataJSON).orderId).toEqual(data.id);
});