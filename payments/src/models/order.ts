import mongoose from 'mongoose';
import {updateIfCurrentPlugin} from 'mongoose-update-if-current';

import {OrderStatus} from '@micsrv/common';

interface OrderAttrs {
    id: string;
    status: OrderStatus;
    version: number;
    userId: string;
    price: number;
}

interface OrderDoc extends mongoose.Document{
    status: OrderStatus;
    version: number;
    userId: string;
    price: number;
}

interface OrderModel extends mongoose.Model<OrderDoc>{
    build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            required: true
        }
    },
    {toJSON: {
        transform (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }}
);

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
    const {id, price, status, userId, version} = attrs;
    return new Order({
        _id: id,
        price,
        status,
        userId,
        version
    });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export {Order};