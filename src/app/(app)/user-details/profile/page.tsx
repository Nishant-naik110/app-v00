// import React from 'react'
// import ProfileCard from '../profile-card';
// import InfoCard from '../info-card';
// import Heading from '../heading';
// const ProfileScreen = () => {

// // Example Profile data for demonstration
// const profileData = {
//     heading: 'My Profile',
//   imageUrl: null,
//   profileInfo: {
//     name: 'User',
//     description: 'mFilterIt',
//     post: 'Developer',
//   },
//   button: {
//     showButton: true,
//     buttonName: 'Edit',
//     buttonClass: 'bg-primary text-white py-2 px-5 rounded-[20px] w-[80px]',
//   },
// };

// const userInfo = {
//   heading: 'Personal Information',
//   data: {
//     "First Name": 'User',
//     "Last Name": 'User',
//     Email: 'abc@getMaxListeners.com',
//     Phone: '+91 12xxxxxxxxx',
//   },
//   button: {
//     showButton: true,
//     buttonName: 'Edit',
//     buttonClass: 'bg-primary text-white py-2 px-5 rounded-[20px] w-[80px]',
//   },
// };

// const userInfo2 = {
//   heading: 'Address',
//   data: {
//     City: 'Bengaluru',
//     Country: 'India',
//     State: 'Karnataka',
//     Postal_Code: '560040',
//   },
//   button: {
//     showButton: true,
//     buttonName: 'Edit',
//     buttonClass: 'bg-primary text-white py-2 px-5 rounded-[20px] w-[80px]',
//   },
// };
//   return (
//     <div>      <div className="flex flex-wrap">
//     <div className="flex w-full md:w-1/2 p-2">
//       <div className="flex-grow flex flex-col">
//         <Heading text={profileData.heading} className="text-sub-header ml-2" />
//         <ProfileCard
//           imageUrl={profileData.imageUrl}
//           profileInfo={profileData.profileInfo}
//           button={profileData.button}
//         />
//       </div>
//     </div>

//     <div className="flex w-full md:w-1/2 p-2">
//       <div className="flex-grow flex flex-col">
//         <Heading text={userInfo.heading} className="text-sub-header ml-2" />
//         <InfoCard data={userInfo.data} button={userInfo.button} />
//       </div>
//     </div>

//     <div className="w-full md:w-1/2 p-2">
//       <div className="flex-grow flex flex-col">
//         <Heading text={userInfo2.heading} className="text-sub-header ml-2" />
//         <InfoCard data={userInfo2.data} button={userInfo2.button} />
//       </div>
//     </div>
//   </div></div>
//   )
// }

// export default ProfileScreen
"use client";
import React, { useEffect, useState } from "react";
import ProfileCard from "../profile-card";
import InfoCard from "../info-card";
import Heading from "../heading";

// Define the structure of the hardcoded response
type ProfileCardData = {
  heading: string;
  imageUrl: string | null;
  profileInfo: { name: string; description: string; post: string };
  button: {
    showButton: boolean;
    buttonName: string;
  };
};

type InfoCardData = {
  heading: string;
  data: {
    "First Name"?: string;
    "Last Name"?: string;
    Email?: string;
    Phone?: string;
    City?: string;
    Country?: string;
    State?: string;
    Postal_Code?: string;
  };
  button?: {
    showButton: boolean;
    buttonName: string;
  };
};

const ProfileScreen = () => {
  const [profileCards, setProfileCards] = useState<ProfileCardData[]>([]);
  const [infoCards, setInfoCards] = useState<InfoCardData[]>([]);

  // Simulated API response (hardcoded data)
  const hardcodedApiResponse = {
    profileCards: [
      {
        heading: "User Details",
        imageUrl: null,
        profileInfo: {
          name: "Test user",
          description: "mFilterIt",
          post: "Developer",
          // Add as many fields as needed
        },
        button: {
          showButton: true,
          buttonName: "Edit",
        },
      },
    ],
    infoCards: [
      {
        heading: "Personal Information",
        data: {
          "First Name": "user",
          "Last Name": "user",
          Email: "abc@example.com",
          Phone: "+91 1234567890",
        },
        button: {
          showButton: true,
          buttonName: "Edit",
        },
      },
      // {
      //   heading: "Personal Information 2",
      //   data: {
      //     "First Name": "abc",
      //     "Last Name": "user",
      //     Email: "def@example.com",
      //     Phone: "+91 9876543210",
      //     City: "Bengaluru",
      //     Country: "India",
      //     State: "Karnataka",
      //     Postal_Code: "560040",
      //   },
      //   button: {
      //     showButton: true,
      //     buttonName: "Edit",
      //   },
      // },
      {
        heading: "Address",
        data: {
          City: "Bengaluru",
          Country: "India",
          State: "Karnataka",
          "Postal Code": "560040",
        },
        button: {
          showButton: true,
          buttonName: "Edit",
        },
      },
    ],
  };

  useEffect(() => {
    setProfileCards(hardcodedApiResponse.profileCards);
    setInfoCards(hardcodedApiResponse.infoCards);
  }, []);

  return (
    <div className="grid pb-4">
      {/* Use grid with 2 equal columns and gap */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {/* Render Profile Cards */}
        {profileCards.map((profile, index) => (
          <div key={index} className="flex flex-col">
            <Heading
              text={profile.heading}
              className="ml-2 text-header text-card-foreground"
            />
            <div className="flex flex-grow items-stretch">
              <ProfileCard
                imageUrl={profile.imageUrl}
                profileInfo={profile.profileInfo}
                button={profile.button}
              />
            </div>
          </div>
        ))}

        {/* Render Info Cards */}
        {infoCards.map((info, index) => (
          <div key={index} className="flex flex-col">
            <Heading
              text={info.heading}
              className="ml-2 text-header text-card-foreground"
            />
            <div className="flex flex-grow items-stretch">
              <InfoCard data={info.data} button={info.button} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileScreen;
