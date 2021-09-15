import {Publisher, PaymentCreatedEvent, Subjects} from '@micsrv/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}