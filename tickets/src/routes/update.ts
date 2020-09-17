import express, {Request, Response} from 'express';
import { Ticket } from '../models/ticket';
import {  requireAuth,validateRequest, NotFoundError, NotAuthorizedError } from '@sandeepchugh/common';
import { body } from 'express-validator';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/tickets/:id', requireAuth,  [
    body('title')
        .not()
        .isEmpty()
        .withMessage('This is required'),
    body('price')
        .isFloat({ gt: 0 })
        .withMessage('Price must be greater than 0')
],validateRequest, async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if(!ticket) {
        throw new NotFoundError();
    }

    if (ticket.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    const { title, price } = req.body;

    ticket.title = title;
    ticket.price = price; 

    await ticket.save()

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        price: ticket.price,
        title: ticket.title,
        userId: ticket.userId,
        version: ticket.version
    })
    
    res.send(ticket);
});

export {router as updateTicketRouter }