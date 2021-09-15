import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';

import {TicketCreatedListener} from './events/ticket-created-listener';

const client = nats.connect('ticketing', randomBytes(4).toString('hex'), {
    url: 'http://localhost:4222'
});

client.on('connect', () => {
    console.log('Listener connected to NATS.');

    client.on('close', () => {
        console.log('NATS connection closed.');
        process.exit();
    });

    new TicketCreatedListener(client).listen();
});

// signal interrupted
process.on('SIGINT', () => client.close());

// signal terminated
process.on('SIGTERM', () => client.close());


