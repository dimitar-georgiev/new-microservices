import {Publisher, ExpirationCompleteEvent, Subjects} from '@micsrv/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}