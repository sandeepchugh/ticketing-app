import { Publisher, OrderCreatedEvent, Subjects } from '@sandeepchugh/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    
}