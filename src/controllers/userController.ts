import express from "express";
import moment from 'moment'
import * as User from "./../db/users";

export default {
  createUser: async (req: express.Request, res: express.Response) => {
    try {
      const { email, firstName, lastName, dateOfBirth, placeOfBirth, utcOffset } =
        req.body;

      const isUserExists = await User.getUserByEmail(email);
      if (isUserExists) throw new Error;

      if (utcOffset < -12 || utcOffset > 14) throw new Error;

      const formatString = 'DD-MM-YYYY';
      const dob = moment.utc(dateOfBirth, formatString);
      if (!dob.isValid) throw new Error;
      const user = await User.createUser({
        email,
        firstName,
        lastName,
        dateOfBirth: dob,
        placeOfBirth,
        utcOffset, // this will be handled by FE to get current user timezone and tells the BE
      });
      return res.status(200).json(user).end()
    } catch (error) {
      console.log(error);
      return res.sendStatus(422);
    }
  },
  getAllUsers: async (_: express.Request, res: express.Response) => {
    try {
      const users = await User.getUsers();
      return res.status(200).json(users);
    } catch (error) {
      console.log(error);
      return res.sendStatus(422);
    }
  },
  getUserByEmail: async (req: express.Request, res: express.Response) => {
    try {
      const { email } = req.params;
      const user = await User.getUserByEmail(email);
      return res.status(200).json(user);
    } catch (error) {
      console.log(error);
      return res.sendStatus(422);
    }
  },
  updateUser: async (req: express.Request, res: express.Response) => {
    try {
      const { email } = req.params;
      const user = await User.getUserByEmail(email);
      if (!user) {
        throw new Error();
      }

      if (req.body.dateOfBirth) {
        const formatString = 'DD-MM-YYYY';
        const dob = moment.utc(req.body.dateOfBirth, formatString);
        if (!dob.isValid) throw new Error;
        user.dateOfBirth = dob.toDate() || user.dateOfBirth;
      }

      user.placeOfBirth = req.body.placeOfBirth || user.placeOfBirth;
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.utcOffset = req.body.utcOffset || user.utcOffset;
      await user.save();
      return res.status(200).json(user).end();
    } catch (error) {
      console.log(error);
      return res.sendStatus(422);
    }
  },
  deleteUser: async (req: express.Request, res: express.Response) => {
    try {
      const { email } = req.params;
      await User.deleteUserByEmail(email);
      return res.status(200).end();
    } catch (error) {
      console.log(error);
      return res.sendStatus(422);
    }
  },
};
