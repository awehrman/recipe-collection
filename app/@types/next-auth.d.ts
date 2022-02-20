declare module "next-auth" {
  interface Session {
    evernoteAuthToken?: string;
    evernoteReqToken?: string;
    evernoteReqSecret?: string;
    userId?: number;
    offset?: number;
  }
}