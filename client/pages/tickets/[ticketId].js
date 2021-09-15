import Router from 'next/router';

import useRequest from "../../hooks/use-request";

const TicketShow = ({ticket}) => {
    const {doRequest, errors} = useRequest({
        url: '/api/orders',
        method: 'post',
        body: {
            ticketId: ticket.id
        },
        onSuccess: (order) => {
            console.log('Order: ', order);
            Router.push('/orders/[orderId]', `/orders/${order.id}`)
        }
    })

    return (
        <div>
            <h4>{ticket.title}</h4>
            <h6>Price: {ticket.price}</h6>
            {errors}
            <button className='btn btn-primary' onClick={e => doRequest()}>Purchase</button>
        </div>
    );
};

TicketShow.getInitialProps = async (context, client) => {
    console.log('Context: ', context);
    const {ticketId} = context.query;

    console.log('Client: ', client);
    const {data} = await client.get(`/api/tickets/${ticketId}`);

    return {ticket: data};
};

export default TicketShow;