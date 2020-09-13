import mongoose from 'mongoose';
import { Order, OrderStatus } from './orders';

interface TicketAttributes {
    title: string;
    price: number;
}

// An interface that describes the properties of the Ticket Model
interface TicketModel extends mongoose.Model<TicketDocument> {
    build(attributes: TicketAttributes): TicketDocument;
}

// An interface that describes the properties of a Ticket Document
export interface TicketDocument extends mongoose.Document {
    title: string;
    price: number;
    isReserved(): Promise<boolean>;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min:0
    }
}, {
    toJSON: {
        transform(doc,ret) {
            ret.id = ret._id;
            delete ret._id; 
        }
    }
});


ticketSchema.statics.build = (attributes: TicketAttributes) => {
    return new Ticket(attributes);
};

ticketSchema.methods.isReserved = async function() {
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    });

    return !!existingOrder;
}

const Ticket = mongoose.model<TicketDocument, TicketModel>('Ticket', ticketSchema);

export { Ticket };