import moment from "moment";
import { BirthdayPublisher } from "../../publisher/birthdayPublisher";
import { ReminderTask } from "./reminderTask";
import { PublisherInterface } from "publisher/publisherInterface";

class BirthdayReminder extends ReminderTask {
    protected reminderType: string = "birthday";
    protected reminderAt: number = parseInt(process.env.BIRTHDAY_REMINDER_SCHEDULE || "9"); // in 24h format
    protected currentUTC = moment.utc();
    protected aggregateParams: any[] = [
        {
          $addFields: {
            userLocalDate: {
              $dateFromParts: {
                year: { $year: this.currentUTC.toDate() },
                month: { $month: this.currentUTC.toDate() },
                day: { $dayOfMonth: this.currentUTC.toDate() },
                hour: { $hour: this.currentUTC.toDate() },
                minute: { $add: [{ $minute: this.currentUTC.toDate() }, "$utcOffset"] },
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
                  $eq: [{ $hour: "$userLocalDate" }, this.reminderAt], // and their local time is 9am
                },
              },
            ],
          },
        },
        {
          $project: {
            email: 1,
            fullName: { $concat: ["$firstName", " ", "$lastName"] },
            dateOfBirth: 1
          },
        },
      ];

    protected publisher: PublisherInterface = new BirthdayPublisher();
}

/**
 * it will run every minutes, because the offset is saved as minute
 * why it runs every minute, because some edge cases is possible that offset value is not a multiplication of 15mins or 30 mins or 10mins
 * e.g. UTC+04:51 https://en.wikipedia.org/wiki/UTC%2B04:51
 */
export const cronBirthdayReminder = () => {
    const birthdayReminder = new BirthdayReminder();
    birthdayReminder.scheduleTask("* * * * *");
}
