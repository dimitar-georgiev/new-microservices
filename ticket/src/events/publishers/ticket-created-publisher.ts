import {Publisher, Subjects, TicketCreatedEvent} from '@micsrv/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;

    
}