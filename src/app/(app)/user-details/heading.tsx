// import React from 'react';

// interface HeadingProps {
//   text: string;
//   headingStyles: {
//     margin: string; // Custom margin for the heading
//     textSize: string;
//     fontWeight: string; // Responsive text size
//   };
// }

// const Heading: React.FC<HeadingProps> = ({ text, headingStyles }) => {
//   return (
//     <h2 className={`${headingStyles.textSize} ${headingStyles.margin} ${headingStyles.fontWeight}`}>
//       {text}
//     </h2>
//   );
// };

// export default Heading;
import React from "react";

interface HeadingProps {
  text: string;
  className: string; // Accept the styles as a single className prop
}

const Heading = ({ text, className }: HeadingProps) => {
  return <h2 className={className}>{text}</h2>;
};

export default Heading;
