export const I_MAILER = 'I_MAILER';

export type Email = { to: string; subject: string; body: string };

export interface IMailer {
  send(email: Email): Promise<void>;
}
