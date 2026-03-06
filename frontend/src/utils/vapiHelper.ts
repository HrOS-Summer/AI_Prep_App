import Vapi from "@vapi-ai/web";


const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;

if (!publicKey) {
  console.warn("VITE_VAPI_PUBLIC_KEY is missing from your .env file");
}

export const vapi = new Vapi(publicKey);