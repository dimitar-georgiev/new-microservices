import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import {json} from 'body-parser';

import {currentUser, NotFoundError, errorHandler} from '@micsrv/common';

import {createTicketRouter} from './routes/new';
import {showTicketRouter} from './routes/show';
import {showAllTicketsRouter} from './routes/index';
import {updateTicketRouter} from './routes/update';

const app = express();

app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}));

app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(showAllTicketsRouter);
app.use(updateTicketRouter);

app.all('*', async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export {app};