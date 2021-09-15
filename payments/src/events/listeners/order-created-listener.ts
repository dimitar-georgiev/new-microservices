import {Message} from 'node-nats-streaming';

import {Listener, OrderCreatedEvent, Subjects} from '@micsrv/common';
import {queueGroupName} from './queue-group-name';
import {Order} from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;

    queueGroupName = queueGroupName;

    async onMessage (data: OrderCreatedEvent['data'], msg: Message) {
        const {id, version, ticket, status, userId} = data;

        const order = Order.build({
            id,
            version,
            status,
            userId,
            price: ticket.price
        });
        await order.save();

        msg.ack();
    }
}