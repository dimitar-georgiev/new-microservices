// StripeCheckout below requires prop-types^15.5.8 or higher to be installed
// It appears that react and prop-types are runtime dependencies, not build dependencies, 
// hence they need to be installed in our application and not rely on those installed in the original package 
import StripeCheckout from 'react-stripe-checkout';
import {useEffect, useState} from 'react';
import Router from 'next/router';

import useRequest from '../../hooks/use-request';

const OrderShow = ({order, currentUser}) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000));
        }

        findTimeLeft();
        const intervalId = setInterval(findTimeLeft, 1000);

        return () => {
            clearInterval(intervalId);
        }
    }, []);

    const {doRequest, errors} = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {orderId: order.id},
        // onSuccess: (payment) => console.log('Payment: ', payment)
        onSuccess: () => Router.push('/orders')
    });

    const msLeft = new Date(order.expiresAt) - new Date();

    if (timeLeft <= 0) {
        return <div>Order Expired!</div>;
    }

    return (
        <div>
            Order Show
            <div>Time left to pay: {timeLeft} seconds</div>

            <StripeCheckout 
                token={({id}) => doRequest({ token : id})}
                stripeKey='pk_test_1TETaL7dZuXeHVutbryv6F4g'
                amount={order.ticket.price * 100}
                email={currentUser.email}
            />
            {errors}
        </div>
    );
};

OrderShow.getInitialProps = async (context, client) => {
    const {orderId} = context.query;

    const {data} = await client.get(`/api/orders/${orderId}`);

    return {order: data};
};

export default OrderShow;