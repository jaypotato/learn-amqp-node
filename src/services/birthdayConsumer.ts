import axios from "axios";
import amqp from "amqplib/callback_api.js";
import { UserModel } from "./../db/users";

export class BirthdayConsumer {
  rabbit;
  constructor() {
    this.rabbit = amqp;
  }

  consume(): void {
    this.rabbit.connect(
      `amqp://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}/`,
      function (error, connection) {
        if (error) {
          throw error;
        }

        connection.createChannel(function (error1, channel) {
          if (error1) {
            throw error1;
          }

          channel.assertQueue("email_queue", {
            durable: true,
          });

          channel.consume("email_queue", async (payload) => {
            if (payload != null) {
              let contents = JSON.parse(payload.content.toString());
              try {
                /**
                 * validate if payload.content is still relevant
                 * just in case, when message are queued, users changes their birthday date, then we won't process that
                 */
                const user = await UserModel.findById(contents._id);
                if (contents.dateOfBirth !== user?.dateOfBirth) return;

                /**
                 * send the email
                 */
                const emailServiceUrl =
                  process.env.EMAIL_SERVICE ||
                  "https://email-service.digitalenvision.com.au/send-email";
                const response = await axios.post(emailServiceUrl, {
                  email: contents.email,
                  message: `Hey, ${contents.fullName} it's your birthday`,
                });
                console.log(
                  `success sending birthday email to ${contents.fullName}. sent at ${response.data.sentTime}`
                );
              } catch (error) {
                console.error(
                  `Error sending birthday email to ${contents.fullName}, caused by ${error}`
                );
              }
            }
          });
        });
      }
    );
  }
}
