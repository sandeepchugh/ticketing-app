import express, {Request, Response} from 'express';
import { isModifier } from 'typescript';
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@sandeepchugh/common';
import { body } from 'express-validator';
import { Order } from '../models/orders';
import { Ticket } from '../models/ticket';


const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post('/api/orders', requireAuth, [
    body('ticketId')    
        .not()
        .isEmpty()
        .withMessage('TicketId must be provided')
], validateRequest,
 async (req: Request, res: Response) => {
    // Find the ticket the user is trying to order in the database
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        throw new NotFoundError();
    }

    // Make sure the ticket is not already reserved
    const isReserved = await ticket.isReserved();
    if(isReserved){
        throw new BadRequestError('Ticket is already reserved')
    }

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    
    // Build the order and save it to the database
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket: ticket
    });

    await order.save();

    // Publish an event for order created
    // TODO:

    res.status(201).send(order);
});

export {router as newOrderRouter }