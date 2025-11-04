import {
  sendOrderStatusUpdateEmail,
  VerifyResetPasswordEmail,
  SendEmail,
} from "../../helper/emailSender"; 
import fs from "fs";
import jwt from "jsonwebtoken";
import { Transporter } from "../../utils/nodemailer"; 
import { FE_URL, JWT_ACCESS_SECRET } from "../../config";

jest.mock("fs", () => ({
  readFileSync: jest.fn(),
}));

jest.mock("../../utils/nodemailer", () => ({
  Transporter: {
    sendMail: jest.fn(),
  },
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

const mockedFsRead = fs.readFileSync as jest.Mock;
const mockedSendMail = Transporter.sendMail as jest.Mock;
const mockedSign = jwt.sign as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('sendOrderStatusUpdateEmail', () => {
  it('should send an order update email correctly', async () => {
    const mockOrder: any = {
      id: "string1",
      status: "PROCESSING",
      user: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    };

    const fakeTemplate = 'Order {{orderId}} is {{status}} for {{customerName}}';
    mockedFsRead.mockReturnValue(fakeTemplate);
    mockedSendMail.mockResolvedValue(true); 

    await sendOrderStatusUpdateEmail(mockOrder);

    expect(mockedFsRead).toHaveBeenCalledWith(
      expect.stringContaining('orderUpdate.hbs'),
      'utf-8'
    );

    expect(mockedSendMail).toHaveBeenCalledTimes(1);

    expect(mockedSendMail).toHaveBeenCalledWith({
      from: '"Bekumart" <noreply@bekumart.com>',
      to: mockOrder.user.email,
      subject: `Update on your order ${mockOrder.id}`,
      html: `Order ${mockOrder.id} is ${mockOrder.status} for John Doe`,
    });
  });

  it('should handle status with underscores', async () => {
    const mockOrder: any = {
      id: 124,
      status: 'PENDING_PAYMENT',
      user: {
        name: 'Jane Doe',
        email: 'jane@example.com',
      },
    };

    const fakeTemplate = 'Status: {{status}}';
    mockedFsRead.mockReturnValue(fakeTemplate);
    mockedSendMail.mockResolvedValue(true);

    await sendOrderStatusUpdateEmail(mockOrder);

    // Periksa logika .replace("_", " ")
    expect(mockedSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: 'Status: PENDING PAYMENT',
      })
    );
  });

  it('should re-throw an error if sendMail fails', async () => {
    const mockOrder: any = { id: 123, status: 'SHIPPED', user: { name: 'John', email: 'john@example.com' } };
    const fakeError = new Error('Mail server down');
    
    mockedFsRead.mockReturnValue('template');
    mockedSendMail.mockRejectedValue(fakeError); 

    await expect(sendOrderStatusUpdateEmail(mockOrder)).rejects.toThrow('Mail server down');
  });
});

describe('VerifyResetPasswordEmail', () => {
  it('should generate a token and send a reset password email', async () => {
    const email = 'test@example.com';
    const fakeToken = 'fake.jwt.token';
    const fakeTemplate = `Reset here: ${FE_URL}/reset-password/${fakeToken}`;

    mockedFsRead.mockReturnValue(fakeTemplate);
    mockedSign.mockReturnValue(fakeToken);
    mockedSendMail.mockResolvedValue(true);

    await VerifyResetPasswordEmail(email);

    expect(mockedSign).toHaveBeenCalledWith(
      { email },
      String(JWT_ACCESS_SECRET),
      { expiresIn: '1h' }
    );

    expect(mockedSendMail).toHaveBeenCalledWith({
      from: "BekuMart",
      to: email,
      subject: 'Reset Password',
      html: fakeTemplate,
    });
  });
});

describe('SendEmail', () => {
  it('should send a contact form email with correct parameters', async () => {
    const data = {
      email: 'customer@example.com',
      name: 'Customer Name',
      message: 'Hello, this is a test message.',
    };
    const fakeTemplate = 'From: {{name}} ({{email}}) - Msg: {{message}}';

    mockedFsRead.mockReturnValue(fakeTemplate);
    mockedSendMail.mockResolvedValue(true);

    await SendEmail(data);

    expect(mockedSendMail).toHaveBeenCalledWith({
      from: 'Customer Name:customer@example.com',
      to: 'nahalilmuchtar2@gmail.com',
      replyTo: 'customer@example.com',
      subject: 'New Contact Form Submission from Customer Name',
      html: 'From: Customer Name (customer@example.com) - Msg: Hello, this is a test message.',
    });
  });
});