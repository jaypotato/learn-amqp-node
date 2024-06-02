import controller from "../../controllers/userController";
import * as User from "../../db/users";
import { Mocked } from "jest-mock";
import { Types } from "mongoose";
import { mockRequest, mockResponse } from "../../__mocks__";
// import moment from "moment";
import momentTZ from "moment-timezone"
import { Request, Response } from "express-serve-static-core";

jest.mock('moment-timezone', () => ({
  default: {
    tz: jest.fn((_) => ({
      zone: jest.fn()
    })),
    utc: jest.fn()
  }
}));

jest.mock("../../db/users");
// jest.mock('moment-timezone')

const request = {
  body: {
    email: "fake@email.com",
    firstName: "john",
    lastName: "doe",
    dateOfBirth: new Date("1990-10-10"),
    placeOfBirth: "Jakarta",
    location: "Asia/Jakarta",
  },
};

const dummyUser = {
  _id: new Types.ObjectId(),
  email: "test@test.test",
  firstName: "john",
  lastName: "doe",
  dateOfBirth: new Date("12-12-1990"),
  placeOfBirth: "Jakarta",
  utcOffset: 420,
  location: "Asia/Jakarta",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Controller Tests", () => {
  describe("createUser", () => {
    it("should create a user successfully", async () => {
      (User.getUserByEmail as jest.Mock).mockResolvedValue(null);
      // (momentTZ.tz.zone as jest.Mock).mockResolvedValue(1);
      const mockCreateUser = {
        body: {
          email: "test@test.test",
          firstName: "john",
          lastName: "doe",
          dateOfBirth: new Date("12-12-1990"),
          placeOfBirth: "Jakarta",
          utcOffset: 420,
          location: "America/New_York",
        },
      } as unknown as Request;
      await controller.createUser(mockCreateUser, mockResponse);
      expect(mockResponse.sendStatus).toHaveBeenCalledWith(200);
    });

    it("should return 422 if user already exists", async () => {
      (User.getUserByEmail as jest.Mock).mockResolvedValue(dummyUser);
      await controller.createUser(mockRequest, mockResponse);
      expect(mockResponse.sendStatus).toHaveBeenCalledWith(422);
    });

    it("should return 422 if location is invalid", async () => {
      (User.getUserByEmail as jest.Mock).mockResolvedValue(null);
      await controller.createUser(mockRequest, mockResponse);
      expect(mockResponse.sendStatus).toHaveBeenCalledWith(422);
    });

    it("should return 422 if dob format is invalid", async () => {
      (User.getUserByEmail as jest.Mock).mockResolvedValue(null);
      const mockWithLocationAndDOB = {
        body: {
          location: "Asia/Jakarta",
          dateOfBirth: "31-31-2031",
        },
      } as unknown as Request;
      await controller.createUser(mockWithLocationAndDOB, mockResponse);
      expect(mockResponse.sendStatus).toHaveBeenCalledWith(422);
    });
  });

  // describe("getAllUsers", () => {
  //   it("should get all users successfully", async () => {
  //     mockedUser.getUsers.mockResolvedValue([
  //       {
  //         _id: new Types.ObjectId(),
  //         email: "test@test.test",
  //         firstName: "john",
  //         lastName: "doe",
  //         dateOfBirth: new Date(),
  //         placeOfBirth: "Jakarta",
  //         utcOffset: 420,
  //         location: "Asia/Jakarta",
  //         createdAt: new Date(),
  //         updatedAt: new Date()
  //       }
  //     ]);

  //   });
  // });
});
