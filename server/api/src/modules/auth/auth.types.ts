// export type CreateUserInput = {
//   name: string;
//   email: string;
//   passwordHash: string;
//   emailVerificationToken: string;
//   emailVerificationTokenExpires: Date;
// };

export type UpdateEmailVerificationTokenAndExpiryInput = {
  email: string;
  emailVerificationToken: string;
  emailVerificationTokenExpires: Date;
};
type DeviceInfo = {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: UAParser.DeviceTypes;
  userAgent: string;
};

export type SignInServiceInput = {
  email: string;
  password: string;
  ipAddress: string;
  deviceInfo: DeviceInfo;
};
