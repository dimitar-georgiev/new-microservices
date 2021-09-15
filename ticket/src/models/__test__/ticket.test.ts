import {Ticket} from '../../models/ticket';

it('implements optimistic concurrency control', async () => {
    // Create an instance of a ticket
    const ticket = Ticket.build({
        title: 'Ticket',
        price: 77,
        userId: '123'
    });


    // Save ticket to the DB
    await ticket.save();
    
    // Fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    // console.log('First Ticket Instance: ', firstInstance);

    const secondInstance = await Ticket.findById(ticket.id);
    // console.log('Second Ticket Instance: ', secondInstance);

    // Make two separate changes to the fetched tickets
    firstInstance!.set({price: 1177});
    secondInstance!.set({price: 7711});

    // Save the first ticket to the DB 
    await firstInstance!.save();

    // Save the second to the DB and expect to fail
    try {
        await secondInstance!.save();
    }
    catch (err) {
        // If it returns here, there was indeed an error and that is expected
        return;
    }
    
    // There wasn't error and this is not what we expect
    throw new Error ('Should not reach this point!');
});

it('increments version number on multiple saves', async () => {
    const ticket = Ticket.build({
        userId: '123',
        title: 'Ticket',
        price: 77
    });
    await ticket.save();

    expect(ticket.version).toEqual(0);

    await ticket.save()
    expect (ticket.version).toEqual(1);
    
    await ticket.save()
    expect (ticket.version).toEqual(2);
});