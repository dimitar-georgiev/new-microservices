import {Message} from 'node-nats-streaming';

import {natsWrapper} from '../../../nats-wrapper';
import {TicketUpdatedListener} from '../ticket-updated-listener';
import {Ticket} from '../../../models/ticket';
import {createMongoObjectId, TicketUpdatedEvent} from '@micsrv/common';

const setup = async () => {
    // Create a listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // Create and save a ticket
    const ticket = Ticket.build({
        id: createMongoObjectId(),
        title: 'Ticket',
        price: 77
    });
    await ticket.save();

    // Create a fake data object
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        title: 'Ticket_1',
        price: 177,
        version: ticket.version + 1,
        userId: createMongoObjectId()
    };

    // Create a fake msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return {listener, ticket, data, msg};
};

it('finds, updates and saves a ticket', async () => {
    const {listener, ticket, data, msg} = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('ack the message', async () => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('doesn\'t call ack() if events out of order', async () => {
    const {listener, data, msg} = await setup();

    data.version = 17;

    try {
        await listener.onMessage(data, msg);
    }
    catch (err) {

    }

    expect(msg.ack).not.toHaveBeenCalled();
});