import nats from 'node-nats-streaming';

import {TicketCreatedPublisher} from './events/ticket-created-publisher';

const client = nats.connect('ticketing', 'abc', {
    url: 'http://localhost:4222'
});

client.on('connect', async () => {
    console.log('Publisher connected to NATS.');

    try {
        await new TicketCreatedPublisher(client).publish({
            id: '123',
            title: 'Title',
            price: 77
        });      
    }
    catch(err) {
        console.error(err);
    }

    
});