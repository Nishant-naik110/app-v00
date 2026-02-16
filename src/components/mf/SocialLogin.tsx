import { FaApple, FaGoogle, FaMeta } from "react-icons/fa6";
import { Button } from "../ui/button";
import { MFDivider } from "./MFDivider";

export const SocialLogin = () => {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-center text-header">Login</h2>
      <Button className="flex w-full gap-2" variant="ghost">
        <FaGoogle size={20} />
        <span>Continue with Google</span>
      </Button>
      <Button className="flex w-full gap-2" variant="ghost">
        <FaApple size={20} />
        <span>Continue with Apple</span>
      </Button>
      <Button className="flex w-full gap-2" variant="ghost">
        <FaMeta size={20} />
        <span>Continue with Meta</span>
      </Button>
      <MFDivider />
    </div>
  );
};
