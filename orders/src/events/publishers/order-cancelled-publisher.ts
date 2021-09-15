import {Publisher, OrderCancelledEvent, Subjects} from '@micsrv/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
};