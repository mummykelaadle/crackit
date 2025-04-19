import React from 'react';

interface CompanyLogoProps {
  name: string;
  className?: string; // Optional prop for additional styling
  onClick?: () => void; // Optional callback for interaction
}

const CompanyLogo: React.FC<CompanyLogoProps> = ({ name, className = "", onClick }) => {
  // Map company names to their brand colors
  const brandColors: Record<string, string> = {
    Amazon: "text-[#FF9900]",
    Flipkart: "text-[#2874F0]",
    Google: "text-[#4285F4]",
    Microsoft: "text-[#00A4EF]",
    Adobe: "text-[#FF0000]",
    Meta: "text-[#0668E1]",
    Twitter: "text-[#1DA1F2]",
    SpaceX: "text-white",
    Neuralink: "text-[#6B7280]",
    Tesla: "text-[#E82127]",
  };

  return (
    <div
      title={`Company: ${name}`} // Tooltip on hover
      onClick={onClick} // Event handler for clicks
      className={`font-bold text-lg ${brandColors[name] || "text-white"} ${className} cursor-pointer`}
    >
      {name}
    </div>
  );
};

export default CompanyLogo;
