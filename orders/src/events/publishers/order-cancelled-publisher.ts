import { Publisher, OrderCreatedEvent, Subjects, OrderCancelledEvent } from '@sandeepchugh/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}