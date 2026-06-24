import dns from "dns";
import { promisify } from "util";


const resolveMx = promisify(dns.resolveMx);

export const validateEmail = async (email) => {
  
  // Basic format check ───
const emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

if (!emailRegex.test(email)) {
  return { valid: false, reason: "Invalid email format" };
}



  //MX Record check  ───
  const domain = email.split("@")[1].toLowerCase();
  try {
    const mxRecords = await resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, reason: "Email domain does not exist" };
    }
  } catch (err) {
    return { valid: false, reason: "Email domain does not exist or is unreachable" };
  }

  return { valid: true };
};