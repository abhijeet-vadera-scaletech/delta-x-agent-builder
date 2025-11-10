import CryptoJS from "crypto-js";

const ENCRYPTION_KEY =
  import.meta.env.VITE_ENCRYPTION_KEY || "secure-encryption-key";

export const encryptData = (data: unknown): string => {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(
      jsonString,
      ENCRYPTION_KEY
    ).toString();
    return encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    return "";
  }
};

export const decryptData = <T>(encryptedData: string): T | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const jsonString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};
