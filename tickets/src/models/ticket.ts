import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// An interface that describes the properties required
// to create a new ticket
interface TicketAttributes {
    title: string;
    price: number;
    userId: string;
}

// An interface that describes the properties of the Ticket Model
interface TicketModel extends mongoose.Model<TicketDocument> {
    build(attributes: TicketAttributes): TicketDocument;
}

// An interface that describes the properties of a Ticket Document
interface TicketDocument extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
    version: number;
    orderId?: string;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    orderId: {
        type: String
    }
}, {
    toJSON: {
        transform(doc,ret) {
            ret.id = ret._id;
            delete ret._id;                    
        }
    }
});

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attributes: TicketAttributes) => {
    return new Ticket(attributes);
};

const Ticket = mongoose.model<TicketDocument, TicketModel>('Ticket', ticketSchema);

export { Ticket };