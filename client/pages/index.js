import Link from 'next/link';

const Index = ({currentUser, tickets}) => {
    const ticketList = tickets.map(ticket => {
        return (
            <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                <td>
                    <Link href='/tickets/[ticketId]' as={`/tickets/${ticket.id}`}>
                        View
                    </Link>
                </td>
            </tr>
        );
    });

    return (
        <div>
            <h3>Tickets</h3>
            <table className='table'>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {ticketList}
                </tbody>
            </table>
        </div>
    );
    
    // console.log('Current UserSS: ', currentUser);

    // return currentUser ? <h1>You are signed in.</h1> : <h1>You are NOT signed in.</h1>;
};

Index.getInitialProps = async (context, client, currentUser) => {
    const {data} = await client.get('/api/tickets');
    console.log('Data: ', data);

    return {tickets: data};
}

export default Index;