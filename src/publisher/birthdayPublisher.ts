import amqp from "amqplib/callback_api.js";
import { PublisherInterface } from "./publisherInterface";

export class BirthdayPublisher implements PublisherInterface{
  rabbit;
  constructor() {
    this.rabbit = amqp;
  }

  execute(payload: any[]): void {
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

          payload.forEach((it) => {
            const data = JSON.stringify(it);
            channel.sendToQueue("email_queue", Buffer.from(data), {
              persistent: true,
            });
          });
        });
      }
    );
  }
}
