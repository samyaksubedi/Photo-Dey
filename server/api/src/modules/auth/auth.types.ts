
export type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
  emailVerificationToken: string;
  emailVerificationTokenExpires: Date;
};


export type UpdateEmailVerificationTokenAndExpiryInput = {
  email: string;
  emailVerificationToken: string;
  emailVerificationTokenExpires: Date;
};
