// export type CreateUserInput = {
//   name: string;
//   email: string;
//   passwordHash: string;
//   emailVerificationToken: string;
//   emailVerificationTokenExpires: Date;
// };

import type { UserRoles } from '../../generated/prisma/enums.js';

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

export type AccessTokenPayload = {
  id: string;
  email: string;
  sessionId: string;
  role: UserRoles;
};
