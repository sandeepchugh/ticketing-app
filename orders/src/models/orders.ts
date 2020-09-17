import mongoose from 'mongoose';
import { OrderStatus } from '@sandeepchugh/common';
import { TicketDocument } from './ticket';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { verify } from 'jsonwebtoken';

// An interface that describes the properties required
// to create a new order
interface OrderAttributes
 {
    status: OrderStatus;
    expiresAt: Date;
    userId: string;
    ticket: TicketDocument;
}

// An interface that describes the properties of the Order Model
interface OrderModel extends mongoose.Model<OrderDocument> {
    build(attributes: OrderAttributes): OrderDocument;
}

// An interface that describes the properties of a Order Document
interface OrderDocument extends mongoose.Document {
    status: OrderStatus;
    expiresAt: Date;
    userId: string;
    ticket: TicketDocument;
    version: number;
}

const orderSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Created
    },
    expiresAt: {
        type: mongoose.Schema.Types.Date,
    },
    userId: {
        type: String,
        required: true
    },
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
    }
}, {
    toJSON: {
        transform(doc,ret) {
            ret.id = ret._id;
            delete ret._id; 
        }
    }
});

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attributes: OrderAttributes) => {
    return new Order(attributes);
};

const Order = mongoose.model<OrderDocument, OrderModel>('Order', orderSchema);

export { Order, OrderStatus };