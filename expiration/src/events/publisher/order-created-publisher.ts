import { Publisher, OrderCreatedEvent, Subjects, ExpirationCompleteEvent } from '@sandeepchugh/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
    
}