import cron from "node-cron";
import moment from "moment";
import { UserModel } from "../../db/users";
import { PublisherInterface } from "../../publisher/publisherInterface";

export abstract class ReminderTask {
  protected abstract reminderType: string;
  protected abstract reminderAt: number;
  protected abstract aggregateParams: any[];
  protected abstract publisher: PublisherInterface;
  protected abstract currentUTC: moment.Moment;

  public scheduleTask(cronExpression: string) {
    cron.schedule(cronExpression, async () => {
      console.log(`Starting ${this.reminderType} reminder task.`);
      const sendAt = this.reminderAt;

      const usersWithLocalTime = await UserModel.aggregate(this.aggregateParams);

      if (usersWithLocalTime.length === 0) {
        console.log(`No user is having a ${this.reminderType}`);
        return;
      }

      const publisher = this.publisher.execute(usersWithLocalTime)
    }).start();
  }
}
