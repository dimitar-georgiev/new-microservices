import express from 'express';

import {Ticket} from '../models/ticket';

const router = express.Router();

router.get('/api/tickets', async (req, res) => {
    // orderId is defined only for paid tickets
    const tickets = await Ticket.find({orderId : undefined});

    res.status(200).send(tickets);
});

export {router as showAllTicketsRouter};