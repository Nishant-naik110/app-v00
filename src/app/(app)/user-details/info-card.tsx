// import React from 'react';
// import { Button } from '@/components/ui/button';
// type ButtonProps = {
//   showButton: boolean;
//   buttonName: string;
//   buttonClass: string;
// };

// type InfoCardProps = {
//   data: { [key: string]: string }; // Key-value pairs for the card data
//   button?: ButtonProps; // Button is optional, so we use "?" to denote that
// };

// const InfoCard: React.FC<InfoCardProps> = ({ data, button }) => {
//   const entries = Object.entries(data);

//   return (
//     <div className="relative border rounded-[3px] p-4 shadow-lg bg-white flex flex-col flex-1">
//       {/* Use CSS Grid for two-column layout */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* Iterate over the entries */}
//         {entries.map((_, index) => {
//           if (index % 2 === 0) {
//             return (
//               <React.Fragment key={index}>
//                 {/* First key-value pair */}
//                 <div className="flex flex-col">
//                   <span className="text-gray-500 text-subBody">{entries[index][0]}</span>
//                   <span className="text-gray-900 text-subBody text-sub-header font-bold break-words">{entries[index][1]}</span>
//                 </div>

//                 {/* Second key-value pair */}
//                 {entries[index + 1] && (
//                   <div className="flex flex-col">
//                     <span className="text-gray-500 text-subBody">{entries[index + 1][0]}</span>
//                     <span className="text-gray-900 text-subHeader font-bold break-words">{entries[index + 1][1]}</span>
//                   </div>
//                 )}
//               </React.Fragment>
//             );
//           }
//           return null;
//         })}
//       </div>

//       {/* Display button if showButton is true */}
//       {button?.showButton && (
//         <div className="mt-auto self-end">
//           <Button  size="icon-xs" className={button.buttonClass}>
//             {button.buttonName}
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default InfoCard;
import React from "react";
import { Button } from "@/components/ui/button";

type ButtonProps = {
  showButton: boolean;
  buttonName: string;
};

type InfoCardProps = {
  data: { [key: string]: string }; // Key-value pairs for the card data
  button?: ButtonProps; // Button is optional, denoted by "?"
};

const InfoCard = ({ data, button }: InfoCardProps) => {
  const entries = Object.entries(data);

  return (
    <div className="relative flex flex-1 flex-col rounded-[3px] border bg-card p-4 text-card-foreground shadow-lg">
      {/* Use CSS Grid for two-column layout */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {/* Iterate over the entries */}
        {entries.map((_, index) => {
          if (index % 2 === 0) {
            return (
              <React.Fragment key={index}>
                {/* First key-value pair */}
                <div className="flex flex-col">
                  <span className="text-sub-header">{entries[index][0]}</span>
                  <span className="break-words text-body">
                    {entries[index][1]}
                  </span>
                </div>

                {/* Second key-value pair */}
                {entries[index + 1] && (
                  <div className="flex flex-col">
                    <span className="text-sub-header">
                      {entries[index + 1][0]}
                    </span>
                    <span className="break-words text-body">
                      {entries[index + 1][1]}
                    </span>
                  </div>
                )}
              </React.Fragment>
            );
          }
          return null;
        })}
      </div>

      {/* Display button if showButton is true */}
      {button?.showButton && (
        <div className="mt-auto self-end">
          <Button size="sm" className="w-auto rounded-full px-6 py-2">
            {button.buttonName}
          </Button>
        </div>
      )}
    </div>
  );
};

export default InfoCard;
