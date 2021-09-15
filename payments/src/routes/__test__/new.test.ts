import request from 'supertest';

import {app} from '../../app';
import {mockSignin, createMongoObjectId, OrderStatus} from '@micsrv/common';
import {Order} from '../../models/order';
import {stripe} from '../../stripe';
import { Payment } from '../../models/payment';

// jest.mock('../../stripe');

const setup = async () => {
    const orderId = createMongoObjectId();
    const userId = createMongoObjectId();
    
    const order = Order.build({
        id: orderId,
        price: 77,
        status: OrderStatus.Created,
        userId,
        version: 0
    });
    await order.save();

    return {order, orderId, userId};
};

it('returns 404 if order not found', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', mockSignin())
        .send({
            token: 'jdfdf',
            orderId: createMongoObjectId()
        })
        .expect(404);
});

it('returns 401 if user is not the owner of the order', async () => {
    const {orderId} = await setup();

    await request(app)
        .post('/api/payments')
        .set('Cookie', mockSignin())
        .send({
            token: 'sdsd',
            orderId
        })
        .expect(401);
});

it('returns 400 if order is already cancelled', async () => {
    const {order, orderId, userId} = await setup();

    order.set({status: OrderStatus.Cancelled});
    await order.save();

    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', mockSignin(userId))
        .send({
            token: 'fkdjf',
            orderId
        })
        .expect(400);

    expect(response.body.errors[0].message).toEqual('Order cancelled.');
});

it('returns 201 with valid inputs', async () => {
    const {order} = await setup();

    await request(app)
        .post('/api/payments')
        .set('Cookie', mockSignin(order.userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201);

    const stripeCharges = await stripe.charges.list({limit: 10});
    const stripeCharge = stripeCharges.data.find(charge => {
        return charge.amount === order.price * 100;
    });

    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual('usd');

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id
    });

    expect(payment).not.toBeNull();

    // Below expectations are used with mock stripe
    // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];

    // console.log('Options: ', chargeOptions);

    // expect(chargeOptions.currency).toEqual('usd');
    // expect(chargeOptions.amount).toEqual(order.price * 100);
    // expect(chargeOptions.source).toEqual('tok_visa');
});