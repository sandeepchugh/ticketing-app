import mongoose from 'mongoose';

// An interface that describes the properties required
// to create a new ticket
interface TicketAttributes {
    title: string;
    price: string;
    userId: string;
}

// An interface that describes the properties of the Ticket Model
interface TicketModel extends mongoose.Model<TicketDocument> {
    build(attributes: TicketAttributes): TicketDocument;
}

// An interface that describes the properties of a Ticket Document
interface TicketDocument extends mongoose.Document {
    title: string;
    price: string;
    userId: string;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc,ret) {
            ret.id = ret._id;
            delete ret._id; 
            delete ret.__v;                     
        }
    }
});


ticketSchema.statics.build = (attributes: TicketAttributes) => {
    return new Ticket(attributes);
};

const Ticket = mongoose.model<TicketDocument, TicketModel>('Ticket', ticketSchema);

export { Ticket };