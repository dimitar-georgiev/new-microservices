import express, {Request, Response} from 'express';
import {body} from 'express-validator';

import {natsWrapper} from '../nats-wrapper';
import {TicketUpdatedPublisher} from '../events/publishers/ticket-updated-publisher';
import {Ticket} from '../models/ticket';

import {requireAuth, validateRequest, NotFoundError, NotAuthorizedError, BadRequestError} from '@micsrv/common';

const router = express.Router();

router.put('/api/tickets/:id', 
    requireAuth, 
    [
        body('title')
            .not()
            .isEmpty()
            .withMessage('Please provide a valid title.'),
        body('price')
            .isFloat({gt: 0})
            .withMessage('Price must be greater than zero.')
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            throw new NotFoundError();
        }

        if (ticket.orderId) {
            throw new BadRequestError('Cannot edit reserved ticket.');
        }

        if (ticket.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        ticket.set({
            title: req.body.title,
            price: req.body.price
        });

        await ticket.save();

        await new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version
        });

        res.status(201).send(ticket);
    }
);

export {router as updateTicketRouter};