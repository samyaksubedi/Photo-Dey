export type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
  emailVerificationToken: string;
  emailVerificationTokenExpires: Date;
};
export type UserExistsInput = {
  email: string;
};
