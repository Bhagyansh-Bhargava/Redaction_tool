'use client'
import React, { useState } from 'react';
import { useEffect } from 'react';
import { Check, Copy } from 'lucide-react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
const Page = () => {
  const [text, setText] = useState('');
  const [base64Image, setbase64Image] = useState('');
  const [image, setImage] = useState(null);
  const [redactedText, setRedactedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('image');

  const filters = {
    "PII (Personally Identifiable Information)": ['ACCOUNT_NUMBER', 'AGE', 'DATE', 'DATE_INTERVAL', 'DOB', 'DRIVER_LICENSE', 'DURATION', 'EMAIL_ADDRESS', 'EVENT', 'FILENAME', 'GENDER_SEXUALITY', 'GENDER', 'SEXUALITY', 'HEALTHCARE_NUMBER', 'IP_ADDRESS', 'LANGUAGE', 'LOCATION', 'LOCATION_ADDRESS', 'LOCATION_ADDRESS_STREET', 'LOCATION_CITY', 'LOCATION_COORDINATE', 'LOCATION_COUNTRY', 'LOCATION_STATE', 'LOCATION_ZIP', 'MARITAL_STATUS', 'MONEY', 'NAME', 'NAME_FAMILY', 'NAME_GIVEN', 'NAME_MEDICAL_PROFESSIONAL', 'NUMERICAL_PII', 'ORGANIZATION', 'ORGANIZATION_MEDICAL_FACILITY', 'OCCUPATION', 'ORIGIN', 'PASSPORT_NUMBER', 'PASSWORD', 'PHONE_NUMBER', 'PHYSICAL_ATTRIBUTE', 'POLITICAL_AFFILIATION', 'RELIGION', 'SSN', 'TIME', 'URL', 'USERNAME', 'VEHICLE_ID', 'ZODIAC_SIGN'],
    "PHI (Protected Health Information)": ['BLOOD_TYPE', 'CONDITION', 'DOSE', 'DRUG', 'INJURY', 'MEDICAL_PROCESS', 'STATISTICS'],
    "PCI (Payment Card Industry)": ['BANK_ACCOUNT', 'CREDIT_CARD', 'CREDIT_CARD_EXPIRATION', 'CVV', 'ROUTING_NUMBER'],
  };
  const handleSelectAll = (category) => {
    const allSelected = filters[category].every((option) =>
      selectedFilters.includes(option)
    );
    if (allSelected) {
      setSelectedFilters(
        selectedFilters.filter((option) => !filters[category].includes(option))
      );
    } else {
      setSelectedFilters([
        ...selectedFilters,
        ...filters[category].filter((option) => !selectedFilters.includes(option)),
      ]);
    }
  };



  
  // Function to read file as Data URL using a Promise
  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(reader.result.split(',')[1]); // Remove the data URL prefix and resolve with Base64 string
      };

      reader.onerror = () => {
        reject(new Error("File reading failed"));
      };

      reader.readAsDataURL(file);
    });
  };

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  const handleCheckboxChange = (option) => {
    setSelectedFilters((prevSelected) =>
      prevSelected.includes(option) ? prevSelected.filter((item) => item !== option) : [...prevSelected, option]
    );

  };

  function encryptData(plainText, secretKey) {
    // Generate a random IV
    const iv = CryptoJS.lib.WordArray.random(16);

    // Encrypt the plain text using AES with the secret key and IV
    const encrypted = CryptoJS.AES.encrypt(plainText, CryptoJS.enc.Utf8.parse(secretKey), {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });

    // Combine IV and encrypted text and encode in Base64
    const encryptedBase64 = CryptoJS.enc.Base64.stringify(iv.concat(encrypted.ciphertext));
    return encryptedBase64;
  }



  const redact = async () => {
    setIsLoading(true);
    const secretKey = '1234567890123456';  // AES-128 requires a 16-byte key
    let JsonData;
    if (selectedOption === 'image' && base64Image) {
      const encryptedText = encryptData(base64Image, secretKey);
      JsonData={text: '',
        image: encryptedText,
        docs: '',
        filters: selectedFilters
      }
      if (!encryptedText) {
        setIsLoading(false);
        setRedactedText("Encryption failed due to missing secret key.");
        return;
      }
    }
    else if (selectedOption === 'text' && text) {
      const encryptedText = encryptData(text, secretKey);
      JsonData={text: encryptedText,
        image: '',
        docs: '',
        filters: selectedFilters
      }
      if (!encryptedText) {
        setIsLoading(false);
        setRedactedText("Encryption failed due to missing secret key.");
        return;
      }
    }
    // const plainText = 'Chat pe soya tha behnoi';  // Replace with your plain text
    try {
      const r = await axios.post("http://127.0.0.1:8000/redact", JsonData)
      // const r = await axios.post("http://13.200.27.54:8182/process-text", JsonData)
      const data = r.data;
      setRedactedText(data.redacted_text);
      setImage(data.image);
      console.log(data.image);
    } catch (error) {
      console.error("Error redacting text:", error);
      setRedactedText("An error occurred while redacting the text.");
    } finally {
      setIsLoading(false);
    }
    // console.log("text:",text);
    // console.log("image in text::",base64Image);
    // console.log('Encrypted Text:', encryptedText);
  };

  const copyToClipboard = async() => {
    try {
      if (selectedOption === 'text') {
        // Copy text to clipboard
        await navigator.clipboard.writeText(redactedText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } else if (selectedOption === 'image') {
        // Copy image to clipboard
        const imageBlob = await fetch(`data:image/png;base64,${image}`).then(res => res.blob());
        const imageData = [new ClipboardItem({ 'image/png': imageBlob })];
  
        await navigator.clipboard.write(imageData);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        console.error('No text or image available to copy');
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };


    const handleImageChange = async (e) => {
        setImage(e.target.files[0]);
        const file = e.target.files[0];
        if (file) {
          try {
            // Await the result of the Promise that resolves the base64 string
            const base64Str = await readFileAsDataURL(file);
    
            setbase64Image(base64Str);
            console.log("image in text:", base64Str);
          } catch (error) {
            console.error("Error reading file:", error);
          }
        }
      };
  return (
    <div className='flex flex-col items-center justify-center py-10'>
        <h2 className='my-3 text-3xl font-bold'>
            PIReT for images
        </h2>
      <input type="file" accept="image/*" onChange={handleImageChange} className="w-5/6  px-3 h-16 py-2 text-white bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-gray-500 " />

          <div className="relative  w-5/6">
            {isFilterOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-10" onClick={toggleFilter}></div>
            )}
            <button className="px-4 text-sm my-3 py-2 bg-gray-300 bg-blend-normal text-black rounded-lg z-20 relative float-right hover:bg-gray-200" onClick={toggleFilter}>
              Filters
            </button>
            {isFilterOpen && (
              <div className="absolute flex max-h-80 overflow-y-auto border bg-black p-6 rounded shadow-lg z-30 bg-opacity-50 space-x-10">
                {Object.keys(filters).map((category) => {
                  const isAllSelected = filters[category].every((option) => selectedFilters.includes(option))
                  return (
                    <div key={category} className="mb-4">
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`${category}-select-all`}
                          className="mr-2"
                          checked={isAllSelected}
                          onChange={() => handleSelectAll(category)}
                        />
                        <h3 className="font-semibold text-lg">{category}</h3>
                      </div>
                      {filters[category].map((option) => (
                        <div key={option} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            id={option}
                            className="mr-2"
                            checked={selectedFilters.includes(option)}
                            onChange={() => handleCheckboxChange(option)}
                          />
                          <label htmlFor={option} className="text-gray-400">{option}</label>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <button
            onClick={redact}
            className=" bg-white text-black font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition duration-200 disabled:opacity-50 w-5/6"
            disabled={isLoading || (!text && !base64Image)}
          >
            {isLoading ? 'Redacting...' : 'Redact Image'}
          </button>
          <div className="w-5/6 my-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg relative">
            {((selectedOption === 'text') && !isLoading)? (
              <div className="bg-gray-700 border border-gray-300 p-4 rounded-md shadow-md text-gray-700">
                <p className="text-white font-mono break-all">{redactedText || 'Redacted text will appear here...'}</p>
              </div>
            ) : ((selectedOption === 'image') && !isLoading) ? (
              <div className="bg-gray-700 border border-gray-300 p-4 rounded-md shadow-md">
                <img
                  src={`data:image/png;base64,${image}`}
                  alt="Redacted_Image"
                  className="w-full max-w-md h-auto"
                  />
              </div>
            ) : (
              <p className="text-white font-mono break-all">Redacted Data will appear here...</p>
            )}
            {(redactedText || image )&& (
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 p-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                aria-label="Copy redacted text"
              >
                {isCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            )}
          </div>
    </div>

  )
}

export default Page
