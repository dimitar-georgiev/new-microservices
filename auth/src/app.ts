import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';

import {json} from 'body-parser';

import {currentUserRouter} from './routes/current-user';
import {signInRouter} from './routes/signin';
import {signOutRouter} from './routes/signout';
import {signUpRouter} from './routes/signup';

import {errorHandler, NotFoundError} from '@micsrv/common';

const app = express();
app.set('trust proxy', true); // tell express to trust ingress proxy

app.use(json());
app.use(cookieSession({
    signed: false, // this indicates that cookies are not encrypted - JWT is already encrypted
    secure: process.env.NODE_ENV !== 'test' // this indicates that cookies will be send only over https
}));

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

app.all('*', async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export {app}