import {Publisher, OrderCreatedEvent, Subjects} from '@micsrv/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
};