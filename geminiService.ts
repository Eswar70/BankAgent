
import { GoogleGenAI, Type } from "@google/genai";
import { UserSession } from "./types";

const SYSTEM_INSTRUCTION = `
You are the "Yellow Bank Super Agent," a high-performance AI designed by Yellow.ai for secure banking operations.

CORE IDENTITY & LANGUAGE:
1. You are a professional, helpful banking agent.
2. CONVERSATION MUST BE IN ENGLISH ONLY. If the user uses any other language, strictly state: "I am restricted to operating in English only."

AUTHENTICATION WORKFLOW (MANDATORY STEPS):
1. Detect "View Loan Details" intent.
2. Request Registered Phone Number.
3. Request Date of Birth (DOB).
4. Inform user that an OTP is being generated.
5. Verify OTP (Handled by UI logic, but you must acknowledge the step).

TOKEN OPTIMIZATION (PROJECTION METHOD):
- When fetching loan accounts (Workflow A), you will be presented with raw data containing 15+ fields.
- YOU MUST ONLY PROJECT/EXTRACT: "Loan Account ID", "Type of Loan", and "Tenure".
- Do not mention or include internal codes, risk profiles, or audit dates unless explicitly requested after authentication.

WORKFLOW B (Loan Details):
- Once an account ID is selected, display tenure, interest rate, principal pending, interest pending, and nominee.
- Always include a "Rate our chat" call to action at the end of Workflow B.

EDGE CASES:
- If user wants to change their number ("old number"), signal a session reset via 'intentClear: true' but maintain the loan intent.
- Respond with specific next steps for the UI to handle.

RESPONSE FORMAT:
- You must always respond in JSON format.
`;

export class YellowBankService {
  private ai: GoogleGenAI;

  constructor() {
    // Robust API key retrieval compatible with Vite, Node, and browser (with fallback)
    // NOTE: Avoids TypeScript errors regarding 'import.meta.env' by narrowing types.

    let apiKey: string | undefined;

    // Check if running in a Vite environment (browser or dev server)
    if (typeof import.meta === "object" && typeof (import.meta as any).env === "object" && typeof (import.meta as any).env.VITE_API_KEY === "string") {
      apiKey = (import.meta as any).env.VITE_API_KEY;
    } else if (typeof process === "object" && typeof process.env === "object") {
      // Node or similar environment
      apiKey = process.env.VITE_API_KEY || process.env.API_KEY;
    }

    if (!apiKey) {
      throw new Error("GoogleGenAI API key is missing. Set VITE_API_KEY in your environment.");
    }
    this.ai = new GoogleGenAI({ apiKey });

  }

  async processMessage(userMessage: string, history: any[], session: UserSession) {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: "user", parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING, description: "The agent's text response." },
            nextStep: { 
              type: Type.STRING, 
              enum: ["REQUEST_PHONE", "REQUEST_DOB", "TRIGGER_OTP", "VERIFY_OTP", "LIST_ACCOUNTS", "SHOW_DETAILS", "CSAT", "NONE"],
              description: "The next logical action for the UI."
            },
            dataProjection: {
              type: Type.OBJECT,
              properties: {
                accountId: { type: Type.STRING },
                intentClear: { type: Type.BOOLEAN }
              }
            }
          },
          required: ["reply", "nextStep"]
        }
      }
    });

    try {
      const jsonStr = response.text || "{}";
      return JSON.parse(jsonStr);
    } catch (e) {
      return { 
        reply: "I apologize, I am experiencing technical difficulties. Error: PARSE_FAIL", 
        nextStep: "NONE" 
      };
    }
  }
}

export const yellowBankService = new YellowBankService();
