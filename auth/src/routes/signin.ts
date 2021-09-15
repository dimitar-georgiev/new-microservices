import express, {Request, Response} from 'express';
import jwt from 'jsonwebtoken';

import {body} from 'express-validator';

import {User} from '../models/user';

import {Password} from '../services/password';

import {validateRequest, BadRequestError} from '@micsrv/common';

const router = express.Router();

router.post('/api/users/signin', [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email.'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('You must provide a password.')
], validateRequest, async (req: Request, res: Response) => {
    const {email, password} = req.body;

    const existingUser = await User.findOne({email});

    if (!existingUser) {
        console.log('#E#: User not found.');
        throw new BadRequestError('Invalid credentials.');
    }

    const passwordMatch = await Password.compare(existingUser.password, password);

    if (!passwordMatch) {
        console.log('#E#: Invalid password.');
        throw new BadRequestError('Invalid credentials.');
    }

    // Generate JWT
    const userJWT = jwt.sign(
        {
            id: existingUser.id,
            email: existingUser.email
        }, 
        process.env.JWT_KEY!
    );

    // Store JWT on req.session
        // req.session.jwt = userJWT; // doesn't work because typescript is not sure if req.session.jwt exists
        req.session = {jwt: userJWT};

    res.status(200).send(existingUser);
});

export {router as signInRouter};