import {Message} from 'node-nats-streaming';

import {Listener, TicketUpdatedEvent, Subjects, NotFoundError} from '@micsrv/common';
import {queueGroupName} from './queue-group-name';
import {Ticket} from '../../models/ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;

    queueGroupName = queueGroupName;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findByIdAndPreviousVersion({id: data.id, version: data.version});

        if (!ticket) {
            // this error will crash the server
            // this listener is sitting outside of the app file (inside of the index file), 
            // hence the error cannot be catch by the errorHandler
            throw new Error('Not found.');
        }
    
        const {title, price} = data;

        ticket.set({title, price});
        await ticket!.save();

        msg.ack();
    }
}