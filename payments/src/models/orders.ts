import mongoose from 'mongoose';
import { OrderStatus } from '@sandeepchugh/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { verify } from 'jsonwebtoken';

// An interface that describes the properties required
// to create a new order
interface OrderAttributes
 {
    id: string;
    version: number;
    status: OrderStatus;
    price: number;
    userId: string;
}

// An interface that describes the properties of the Order Model
interface OrderModel extends mongoose.Model<OrderDocument> {
    build(attributes: OrderAttributes): OrderDocument;
}

// An interface that describes the properties of a Order Document
interface OrderDocument extends mongoose.Document {
    version: number;
    status: OrderStatus;
    price: number;
    userId: string;
}

const orderSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Created
    },
    price: {
        type: Number,
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
        }
    }
});

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attributes: OrderAttributes) => {
    return new Order({
        _id: attributes.id,
        version: attributes.version,
        price: attributes.price,
        userId: attributes.userId,
        status: attributes.status
    });
};

const Order = mongoose.model<OrderDocument, OrderModel>('Order', orderSchema);

export { Order, OrderStatus };