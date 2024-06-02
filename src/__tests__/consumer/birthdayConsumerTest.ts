import axios from 'axios';
import { BirthdayConsumer } from '../../consumer/birthdayConsumer'
import { UserModel } from "../../db/users";

jest.mock('axios');

jest.mock('amqplib/callback_api.js', () => ({
    connect: jest.fn((_, callback) => {
      
      const mockConnection = {
        createChannel: jest.fn((callback) => {
         
          const mockChannel = {
            assertQueue: jest.fn(),
            consume: jest.fn(),
            ack: jest.fn(),
            nack: jest.fn(),
          };
          callback(null, mockChannel); 
          return mockChannel;
        }),
      };
      callback(null, mockConnection);
    }),
  }));
  

  jest.mock("../../db/users");


describe('BirthdayConsumer', () => {
  let consumer: BirthdayConsumer;

  beforeEach(() => {
    consumer = new BirthdayConsumer();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should consume and process birthday messages', async () => {
    (UserModel.findById as jest.Mock).mockResolvedValueOnce({
      _id: 'user_id',
      dateOfBirth: new Date('2000-01-01'),
    });

    (axios.post as jest.Mock).mockResolvedValueOnce({ data: { sentTime: new Date() } });
    consumer.consume();
    const payload = {
      content: Buffer.from(
        JSON.stringify({
          _id: 'user_id',
          email: 'test@example.com',
          fullName: 'Test User',
          dateOfBirth: '2000-01-01',
        })
      ),
    };
    const consumeCallback = (jest.requireMock('amqplib/callback_api.js').connect as jest.Mock).mock.calls[0][1];
    await consumeCallback(payload);

    expect(axios.post).toHaveBeenCalledWith(expect.any(String), {
      email: 'test@example.com',
      message: expect.stringContaining('Test User'),
    });
  });
});
