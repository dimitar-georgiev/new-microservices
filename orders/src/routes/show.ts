import express, {Request, Response} from 'express';

import {Order} from '../models/order';
import {NotFoundError, NotAuthorizedError} from '@micsrv/common';

const router = express.Router();

// needs validation for the req.params.orderId
router.get('/api/orders/:orderId', async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId)
        .populate('ticket');

    if (!order) {
        throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }
    
    res.send(order);
});

export {router as showSingleOrderRouter};