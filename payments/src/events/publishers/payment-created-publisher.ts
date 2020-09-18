import {Publisher, Subjects, PaymentCreatedEvent } from '@sandeepchugh/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated
}

