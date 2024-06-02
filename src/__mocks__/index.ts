import { Request, Response } from "express-serve-static-core";

export const mockRequest = {} as Request;
export const mockResponse = {
    sendStatus: jest.fn(),
    status: jest.fn()
} as unknown as Response;
