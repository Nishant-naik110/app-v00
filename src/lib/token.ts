
import { UnauthorizedError } from "@/common/errors/";
export const getToken = () => {
  const accessToken = localStorage.getItem("AccessToken");
  
  if (accessToken) {
    const d = Buffer.from(accessToken.split(".")[1], "base64").toString("ascii");
    return JSON.parse(d);
  }
 
  throw new UnauthorizedError("Please Log in");
};

export const getIDToken = () => {
  const idToken = localStorage.getItem("IDToken");
  if (idToken) {
    const d = Buffer.from(idToken.split(".")[1], "base64").toString("ascii");
    return JSON.parse(d);
  }
  throw new UnauthorizedError("Please Log in");
};
