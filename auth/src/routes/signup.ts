import express, {Request, Response} from 'express';
import {body} from 'express-validator';

import jwt from 'jsonwebtoken';

import {validateRequest, BadRequestError} from '@micsrv/common';

import {User} from '../models/user';

const router = express.Router();

router.post('/api/users/signup', [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email.'),
    body('password')
        .trim()
        .isLength({min: 4, max: 7})
        .withMessage('Please provide a password between 4 and 7 characters.')
], validateRequest, async (req: Request, res: Response) => {

    const {email, password} = req.body;

    const existingUser = await User.findOne({email});

    if (existingUser) {
        throw new BadRequestError('Email exists!');
    }

    const user = User.build({
        email,
        password
    });

    await user.save();

    // Generate JWT
    const userJWT = jwt.sign(
        {
            id: user.id,
            email: user.email
        }, 
        process.env.JWT_KEY!
    );

    // Store JWT on req.session
        // req.session.jwt = userJWT; // doesn't work because typescript is not sure if req.session.jwt exists
        req.session = {jwt: userJWT};

    res.status(201).send(user);
});

export {router as signUpRouter};