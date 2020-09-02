import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest } from '@sandeepchugh/common';
import { User } from '../models/user';
import { BadRequestError } from '@sandeepchugh/common';
import { Password } from '../services/password';

const router = express.Router();

router.post('/api/users/signin', [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password cannot be empty')
], validateRequest,
 async (req: Request, res: Response)=> {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
        throw new BadRequestError('Invalid credentials');
    }
    
    const passwordMatch = await Password.compare(
        existingUser.password, 
        password);
    
    if(!passwordMatch) {
        throw new BadRequestError('Invalid credentials');
    }    

    const userJwt = jwt.sign({
        id: existingUser.id,
        email: existingUser.email},
        process.env.JWT_KEY!
    );

    req.session = { 
        jwt: userJwt 
    };

    return res.status(200).send(existingUser);
});

export { router as signinRouter };