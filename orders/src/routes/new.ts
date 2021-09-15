import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import mongoose from 'mongoose';

import {validateRequest, NotFoundError, BadRequestError, OrderStatus} from '@micsrv/common';
import {Order} from '../models/order';
import {Ticket} from '../models/ticket';
import {OrderCreatedPublisher} from '../events/publishers/order-created-publisher';
import {natsWrapper} from '../nats-wrapper';

const router = express.Router();

router.post(
        '/api/orders', 
        [
            body('ticketId')
                .not()
                .isEmpty()
                // the check bellow assumes that the input is mongo ID object which might be not correct in a different implementation
                // this assumption creates unwanted coupling between the services
                
                .custom((input: string) => {
                    return mongoose.isValidObjectId(input); 
                })
                .withMessage('A valid ticketId must be provided.')
        ], 
        validateRequest,
        async (req: Request, res: Response) => {
            const {ticketId} = req.body;

            // Find the ticket
            const ticket = await Ticket.findById(ticketId);

            if (!ticket) {
                throw new NotFoundError();
            }

            // Check if the ticket is already reserved

            const isReserved = await ticket.isReserved();

            if (isReserved) {
                throw new BadRequestError('Ticket is already reserved.');
            }

            // Calculate expiration date
            const expiration = new Date();

            expiration.setSeconds(expiration.getSeconds() + 30);

            // Build the Order and save to the DB
            const order = Order.build({
                userId: req.currentUser!.id,
                status: OrderStatus.Created,
                expiresAt: expiration,
                ticket
            });
            await order.save();

            // Publish order:created event
            new OrderCreatedPublisher(natsWrapper.client).publish({
                id: order.id,
                version: order.version,
                status: order.status,
                userId: order.userId,
                expiresAt: order.expiresAt.toISOString(),
                ticket: {
                    id: ticket.id,
                    price: ticket.price
                }
            });

            res.status(201).send(order);
        }
);

export {router as createNewOrderRouter};