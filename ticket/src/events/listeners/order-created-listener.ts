import {Message} from 'node-nats-streaming';

import {Listener, OrderCreatedEvent, Subjects} from '@micsrv/common';
import {queueGroupName} from './queue-group-name';
import {Ticket} from '../../models/ticket';
import {TicketUpdatedPublisher} from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;

    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        // Find the ticket reserved by the order
        const ticket = await Ticket.findById(data.ticket.id);

        if (!ticket) {
            throw new Error('Ticket not found.');
        }

        // Mark the ticket as being reserved by setting the order ID
        ticket.set({orderId: data.id});
        await ticket.save();

        // await to finish because there might be an error and if we don't await the message will be ack() even if there is error
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            version: ticket.version,
            userId: ticket.userId,
            orderId: ticket.orderId
        });

        // ack() the message
        msg.ack();
    }
};