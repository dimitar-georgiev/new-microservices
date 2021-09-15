import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from 'cookie-session';

import {currentUser, requireAuth, NotFoundError, errorHandler} from '@micsrv/common';

import {showAllOrdersRouter} from './routes/index';
import {deleteOrderRouter} from './routes/delete';
import {createNewOrderRouter} from './routes/new';
import {showSingleOrderRouter} from './routes/show';

const app = express();

app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}));

app.use(currentUser);
app.use(requireAuth);

app.use(showAllOrdersRouter);
app.use(deleteOrderRouter);
app.use(createNewOrderRouter);
app.use(showSingleOrderRouter);

app.all('*', async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export {app};