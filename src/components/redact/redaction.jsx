import React, { useState } from 'react';
import { useEffect } from 'react';
import { Check, Copy } from 'lucide-react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import styles from './redact.module.css';

const RedactionComponent = () => {
    const [text, setText] = useState('');
    const [base64Image, setbase64Image] = useState('');
    const [image, setImage] = useState(null);
    const [redactedText, setRedactedText] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState(['ACCOUNT_NUMBER', 'AGE', 'DATE', 'DATE_INTERVAL', 'DOB', 'DRIVER_LICENSE', 'DURATION', 'EMAIL_ADDRESS', 'FILENAME', 'IP_ADDRESS', 'LOCATION', 'LOCATION_ADDRESS', 'LOCATION_ADDRESS_STREET', 'LOCATION_CITY', 'LOCATION_COORDINATE', 'LOCATION_COUNTRY', 'LOCATION_STATE', 'LOCATION_ZIP', 'MONEY', 'NAME', 'NAME_FAMILY', 'NAME_GIVEN', 'NAME_MEDICAL_PROFESSIONAL', 'NUMERICAL_PII', 'ORGANIZATION', 'OCCUPATION', 'ORIGIN', 'PASSPORT_NUMBER', 'PASSWORD', 'PHONE_NUMBER', 'SSN', 'URL', 'USERNAME', 'VEHICLE_ID', 'BANK_ACCOUNT', 'CREDIT_CARD', 'CREDIT_CARD_EXPIRATION', 'CVV']);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('text');

  const filters = {
    "PII (Personally Identifiable Information)": ['ACCOUNT_NUMBER', 'AGE', 'DATE', 'DATE_INTERVAL', 'DOB', 'DRIVER_LICENSE', 'DURATION', 'EMAIL_ADDRESS', 'FILENAME', 'IP_ADDRESS', 'LOCATION', 'LOCATION_ADDRESS', 'LOCATION_ADDRESS_STREET', 'LOCATION_CITY', 'LOCATION_COORDINATE', 'LOCATION_COUNTRY', 'LOCATION_STATE', 'LOCATION_ZIP', 'MONEY', 'NAME', 'NAME_FAMILY', 'NAME_GIVEN', 'NAME_MEDICAL_PROFESSIONAL', 'NUMERICAL_PII', 'ORGANIZATION', 'OCCUPATION', 'ORIGIN', 'PASSPORT_NUMBER', 'PASSWORD', 'PHONE_NUMBER', 'SSN', 'URL', 'USERNAME', 'VEHICLE_ID'],
    "PCI (Payment Card Industry)": ['BANK_ACCOUNT', 'CREDIT_CARD', 'CREDIT_CARD_EXPIRATION', 'CVV'],
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
    // Json={text:''}
      if (!encryptedText) {
        setIsLoading(false);
        setRedactedText("Encryption failed due to missing secret key.");
        return;
      }
    }
    else if (selectedOption === 'text' && text) {
      const encryptedText = encryptData(text, secretKey);
      console.log("we should be here")
      JsonData={text: encryptedText,
        image: '',
        docs: '',
        filters: selectedFilters
      }
    // JsonData={text: text}
      if (!encryptedText) {
        setIsLoading(false);
        setRedactedText("Encryption failed due to missing secret key.");
        return;
      }
    }
    // const plainText = 'Chat pe soya tha behnoi';  // Replace with your plain text
    try {
      const r = await axios.post("http://127.0.0.1:8000/redact", JsonData)
      console.log(JsonData)
      // const r = await axios.post("http://13.200.27.54:8182/process-text", JsonData)
      const data = r.data
    //   console.log("data is "+r.data)
    //   const data = r.processed_text;
      setRedactedText(r.data.redacted_text);
    //   console.log(data)
      setImage(data.image);
    //   console.log(data.image);
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
        await navigator.clipboard.writeText(RedactedText);
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

  return (
    <main>
      <h1 className={styles.mainTitle}>Here is how PIReT solves these problems</h1>
      <div className={styles.mainContainer}>
        <div className={styles.container}>
          <h2 className={styles.title}>Text Redaction</h2>
          <p className={styles.titleText}>Automatically redact sensitive words or phrases from your texts. Try yourself and find out!</p>
          <div className={styles.filldiv}>
            <button className={styles.filterButton} onClick={toggleFilter}>
              Apply Filters
            </button>
          </div>
          <div className={styles.redactArea}>
            <div className={styles.inputArea}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className={styles.textInput}
                rows={8}
                placeholder="Enter your text here..."
              />
            </div>
            <div className={styles.outputArea}>
              <div className={styles.redactedContent}>
                {!isLoading && (
                  <p className={styles.redactedText}>
                    {redactedText || 'Redacted text will appear here...'}
                  </p>
                )}
                {(redactedText || image) && (
                  <button
                    onClick={copyToClipboard}
                    className={styles.copyButton}
                    aria-label="Copy redacted text"
                  >
                    {isCopied ? <Check className={styles.icon} /> : <Copy className={styles.icon} />}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className={styles.buttonGroup}>
            <button
              onClick={redact}
              className={styles.redactButton}
              disabled={isLoading || (!text && !base64Image)}
            >
              {isLoading ? 'Redacting...' : 'Redact Text'}
            </button>
            {/* <button className={styles.synthButton}>Synthesize Text</button> */}
          </div>
          {isFilterOpen && (
            <div className={styles.filterOverlay} onClick={toggleFilter}></div>
          )}
          {isFilterOpen && (
            <div className={styles.filterMenu}>
              {Object.keys(filters).map((category) => {
                const isAllSelected = filters[category].every((option) => selectedFilters.includes(option));
                return (
                  <div key={category} className={styles.filterCategory}>
                    <div className={styles.filterCategoryHeader}>
                      <input
                        type="checkbox"
                        id={`${category}-select-all`}
                        className={styles.filterCheckbox}
                        checked={isAllSelected}
                        onChange={() => handleSelectAll(category)}
                      />
                      <h3 className={styles.filterCategoryTitle}>{category}</h3>
                    </div>
                    {filters[category].map((option) => (
                      <div key={option} className={styles.filterOption}>
                        <input
                          type="checkbox"
                          id={option}
                          className={styles.filterCheckbox}
                          checked={selectedFilters.includes(option)}
                          onChange={() => handleCheckboxChange(option)}
                        />
                        <label htmlFor={option} className={styles.filterLabel}>{option}</label>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>      
    </main>
  );
};

export default RedactionComponent;




