import {Publisher, Subjects, TicketUpdatedEvent } from '@sandeepchugh/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated
}

