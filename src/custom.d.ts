import { UserRoles } from "@prisma/client";

export interface IUserReqParam {
  id: string; 
  name: string;
  email: string;
  role: UserRoles;
}

declare global {
  namespace Express {
    export interface Request {
      user?: IUserReqParam;
    }
  }
}