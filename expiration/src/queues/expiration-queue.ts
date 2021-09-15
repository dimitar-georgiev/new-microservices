import Queue from 'bull';

import {ExpirationCompletePublisher} from '../events/publishers/expiration-complete-publisher';
import {natsWrapper} from '../nats-wrapper';

interface Payload {
    orderId: string;
}

const expirationQueue = new Queue<Payload>('order:expiration', {
    redis: {
        host: process.env.REDIS_HOST
    }
});

// Process the jobs coming back from Redis
expirationQueue.process(async job => {
    console.log('Publish an expiration:complete event for orderId - ', job.data.orderId);
    new ExpirationCompletePublisher(natsWrapper.client).publish({ orderId: job.data.orderId });
});

export {expirationQueue};