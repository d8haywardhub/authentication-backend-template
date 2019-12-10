import {Request, Response, NextFunction } from 'express';
import HttpException from '../exceptions/HttpException';

function errorMiddleware(error: HttpException, request: Request, response: Response, next: NextFunction  ):void {
    const status = error.status || 500;
    const message = error.message || 'Something unhandled went wrong';
    response.status(status)
        .send({
            message,
            status
        });
}

export default errorMiddleware;