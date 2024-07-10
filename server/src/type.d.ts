import { Request } from 'express';
declare global {
  namespace Express {
    interface MulterFile {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    }

    interface Request {
      file?: MulterFile;
      user?: User;
      event?: Event;
      ticket?: Ticket;
      order?: Order;
      seat?: Seat;
    }
  }
}