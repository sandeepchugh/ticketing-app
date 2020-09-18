import mongoose from 'mongoose';
import { OrderStatus } from '@sandeepchugh/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { verify } from 'jsonwebtoken';

// An interface that describes the properties required
// to create a new order
interface PaymentAttributes
 {
    orderId: string;
    stripeId: string;
}

// An interface that describes the properties of the Payment Model
interface PaymentModel extends mongoose.Model<PaymentDocument> {
    build(attributes: PaymentAttributes): PaymentDocument;
}

// An interface that describes the properties of a Payment Document
interface PaymentDocument extends mongoose.Document {
    orderId: string;
    stripeId: string;
}

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    stripeId: {
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

paymentSchema.set('versionKey', 'version');
paymentSchema.plugin(updateIfCurrentPlugin);

paymentSchema.statics.build = (attributes: PaymentAttributes) => {
    return new Payment({
        orderId: attributes.orderId,
        stripeId: attributes.stripeId
    });
};

const Payment = mongoose.model<PaymentDocument, PaymentModel>('Payment', paymentSchema);

export { Payment };