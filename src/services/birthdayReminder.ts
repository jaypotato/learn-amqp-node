import cron from "node-cron";
import moment from "moment";
import { UserModel } from "../db/users";
import { BirthdayPublisher } from "./birthdayPublisher";

/**
 * it will run every minutes, because the offset is saved as minute
 * why it runs every minute, because some edge cases is possible that offset value is not a multiplication of 15mins or 30 mins or 10mins
 * e.g. UTC+04:51 https://en.wikipedia.org/wiki/UTC%2B04:51
 */
const birthdayReminderTask = cron.schedule("* * * * *", async () => {
  console.log("starting cron every minute");
  const sendAt = parseInt(process.env.BIRTHDAY_REMINDER_SCHEDULE || "9"); // in 24h format
  const currentUTC = moment.utc();

  const usersWithLocalTime = await UserModel.aggregate([
    {
      $addFields: {
        userLocalDate: {
          $dateFromParts: {
            year: { $year: currentUTC.toDate() },
            month: { $month: currentUTC.toDate() },
            day: { $dayOfMonth: currentUTC.toDate() },
            hour: { $hour: currentUTC.toDate() },
            minute: { $add: [{ $minute: currentUTC.toDate() }, "$utcOffset"] },
          },
        },
      },
    },
    {
      $addFields: {
        isTodayBirthday: {
          $and: [
            {
              $eq: [{ $month: "$userLocalDate" }, { $month: "$dateOfBirth" }],
            },
            {
              $eq: [
                { $dayOfMonth: "$userLocalDate" },
                { $dayOfMonth: "$dateOfBirth" },
              ],
            },
          ],
        },
      },
    },
    {
      $match: {
        $and: [
          { isTodayBirthday: true }, // today is their birthday
          {
            $expr: {
              $eq: [{ $hour: "$userLocalDate" }, sendAt], // and their local time is 9am
            },
          },
        ],
      },
    },
    {
      $project: {
        email: 1,
        fullName: { $concat: ["$firstName", " ", "$lastName"] },
      },
    },
  ]);

  // skipping if no one is having birthday
  if (usersWithLocalTime.length === 0) {
    console.log("no user is having a birthday");
    return;
  }

  const bp = new BirthdayPublisher();
  bp.execute(usersWithLocalTime);
});

export const cronBirthdayReminder = birthdayReminderTask.start();
