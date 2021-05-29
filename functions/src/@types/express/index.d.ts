// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as admin from "firebase-admin";

export {};

declare global {
  namespace Express {
    interface Request {
      user: admin.auth.DecodedIdToken;
    }
  }
}
