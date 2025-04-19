'use client';

import { useRef } from "react";
import CompanyLogo from "./CompanyLogo";


export function LogoMarquee() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  // Company names
  const companies = [
    "Amazon",
    "Flipkart",
    "Google",
    "Microsoft",
    "Adobe",
    "Meta",
    "Twitter",
    "SpaceX",
    "Neuralink",
    "Tesla",
  ];

  // Duplicate the companies array to create a seamless loop
  const allCompanies = [...companies, ...companies];

  return (
    <div className="w-full overflow-hidden  py-8">
      <div className="mb-4 text-center">
        <h3 className="text-xl font-semibold text-white">Our graduates work at top companies</h3>
      </div>

      <div className="relative flex w-full overflow-hidden">
        <div ref={marqueeRef} className="animate-marquee flex items-center space-x-16 py-4">
          {allCompanies.map((company, index) => (
            <div key={`${company}-${index}`} className="flex items-center justify-center h-12 min-w-32">
              <CompanyLogo name={company} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
