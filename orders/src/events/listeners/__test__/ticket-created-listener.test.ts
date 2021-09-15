import {Message} from 'node-nats-streaming';

import {TicketCreatedListener} from '../ticket-created-listener';
import {natsWrapper} from '../../../nats-wrapper';
import {TicketCreatedEvent, createMongoObjectId} from '@micsrv/common';
import {Ticket} from '../../../models/ticket';

const setup = () => {
    // Create an instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client);

    // Create a fake data event
    const data: TicketCreatedEvent['data'] = {
        id: createMongoObjectId(),
        version: 0,
        title: 'Ticket',
        price: 77,
        userId: createMongoObjectId()
    };

    // Create a fake Message object
    // We don't want to fake all the methods inside Message, so we ignore the typescript error
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, msg};
};

it('creates and saves ticket', async () => {
    const {listener, data, msg} = setup();

    // Call the onMessage() with the data and message objects
    await listener.onMessage(data, msg);

    // Write assertions that the ticket was created
    const ticket = await Ticket.findById(data.id);

    expect(ticket!.id).toEqual(data.id);
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
});

it('ack the message', async () => {
    const {listener, data, msg} = setup();
    
    // Call the onMessage() with the data and message objects
    await listener.onMessage(data, msg);

    // Make sure that ack() was called
    expect(msg.ack).toHaveBeenCalled();
});