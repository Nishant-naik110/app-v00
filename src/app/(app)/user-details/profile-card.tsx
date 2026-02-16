import React from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProfileCardProps = {
  imageUrl: string | null;
  profileInfo: { [key: string]: string }; // Named keys for better type checking
  button: {
    showButton: boolean;
    buttonName: string;
  };
};

const ProfileCard = ({
  imageUrl,
  profileInfo,
  button,
}: ProfileCardProps) => {
  return (
    <div className="relative flex flex-1 flex-col rounded-[3px] border bg-card p-4 text-card-foreground shadow-lg">
      <div className="mb-4 flex items-center">
        {/* Display image or fallback to User icon */}
        <div className="mr-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={profileInfo.name || "User Profile"}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <User className="h-24 w-24 text-gray-400" />
          )}
        </div>

        {/* Display profile information dynamically */}
        <div className="flex flex-col text-left">
          {Object.entries(profileInfo).map(([key, value], i) => (
            <div key={i} className="text-body">
              {value}
            </div>
          ))}
        </div>
      </div>

      {/* Conditionally render the button at the bottom right of the card */}
      {button.showButton && (
        <div className="mt-auto self-end">
          <Button size="sm" className="w-auto rounded-full px-6 py-2">
            {button.buttonName}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
