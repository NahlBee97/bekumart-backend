import { UserRoles } from "@prisma/client";
import { User } from "@prisma/client";

export interface IUserReqParam {
  id: number; 
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