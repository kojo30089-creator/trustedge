"use client";
import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface CountryCode {
  code: string;
  label: string;
}

interface PhoneInputProps {
  countries: CountryCode[];
  placeholder?: string;
  onChange?: (phoneNumber: string) => void;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  countries,
  placeholder = "555 000-0000",
  onChange,
}) => {
  // Use the first country in the list as the default
  const defaultCountry = countries[0];
  const [selectedCountry, setSelectedCountry] = useState<string>(defaultCountry?.code || "");
  const [phoneNumber, setPhoneNumber] = useState<string>(defaultCountry?.label || "");

  // Ensure the parent form gets the default value on mount
  useEffect(() => {
    if (defaultCountry && onChange) {
      onChange(defaultCountry.label);
    }
  }, []);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountryCode = e.target.value;
    const countryObj = countries.find(c => c.code === newCountryCode);
    
    if (countryObj) {
      setSelectedCountry(newCountryCode);
      setPhoneNumber(countryObj.label); // Sets state to default prefix like +234
      if (onChange) {
        onChange(countryObj.label); // Updates parent form
      }
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    if (onChange) {
      onChange(value);
    }
  };

  // Luxury Styling Variables
  const containerBase = "group relative flex items-center w-full bg-transparent transition-all duration-300";
  const innerBorder = "border border-black/10 dark:border-white/10 rounded-xl group-focus-within:border-[#e51837] group-focus-within:ring-2 group-focus-within:ring-[#e51837]/20 shadow-sm";
  
  return (
    <div className={`${containerBase} ${innerBorder}`}>
      
      {/* Country Selector Side */}
      <div className="relative flex items-center h-full border-r border-black/5 dark:border-white/5 px-3 py-3.5">
        <select
          value={selectedCountry}
          onChange={handleCountryChange}
          className="appearance-none bg-transparent pr-5 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none cursor-pointer z-10"
        >
          {countries.map((country) => (
            <option key={country.code} value={country.code} className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white">
              {country.code} {/* Shows US, NG, etc in the dropdown list */}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 h-3.5 w-3.5 text-slate-400 pointer-events-none" strokeWidth={2.5} />
      </div>

      {/* Number Input Side */}
      <input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        placeholder={placeholder}
        className="flex-1 bg-transparent py-3.5 px-4 text-sm font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none"
      />

    </div>
  );
};

export default PhoneInput;