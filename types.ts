
export type MessageRole = 'user' | 'agent';

export interface LoanAccount {
  id: string;
  type: string;
  tenure: string;
  // Extra fields for simulation (token optimization testing)
  internalBankCode: string;
  auditDate: string;
  branchLocation: string;
  managerName: string;
  lastUpdated: string;
  riskProfile: string;
  currency: string;
  isEligibleForTopUp: boolean;
  insuranceProvider: string;
  taxIdentifier: string;
  interestCycle: string;
  repaymentMethod: string;
}

export interface LoanDetails {
  tenure: string;
  interest_rate: string;
  principal_pending: string;
  interest_pending: string;
  nominee: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  text?: string;
  type?: 'text' | 'cards' | 'quick-replies' | 'csat';
  data?: any;
  timestamp: Date;
}

export enum AuthStep {
  NONE = 'NONE',
  COLLECTING_PHONE = 'COLLECTING_PHONE',
  COLLECTING_DOB = 'COLLECTING_DOB',
  COLLECTING_OTP = 'COLLECTING_OTP',
  AUTHENTICATED = 'AUTHENTICATED'
}

export interface UserSession {
  intent: string | null;
  authStep: AuthStep;
  phoneNumber: string | null;
  dob: string | null;
  generatedOtp: string | null;
  selectedAccountId: string | null;
}
