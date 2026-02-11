
import { LoanAccount, LoanDetails } from './types';

export const triggerOTP = (): string => {
  const otps = ['1234', '5678', '7889', '1209'];
  return otps[Math.floor(Math.random() * otps.length)];
};

export const getLoanAccounts = (): LoanAccount[] => {
  return [
    {
      id: "LN-98421",
      type: "Home Loan",
      tenure: "15 Years",
      internalBankCode: "HB-77-X",
      auditDate: "2023-10-12",
      branchLocation: "Downtown Branch",
      managerName: "Alice Johnson",
      lastUpdated: "2023-11-01",
      riskProfile: "Low",
      currency: "USD",
      isEligibleForTopUp: true,
      insuranceProvider: "SecureLife",
      taxIdentifier: "TX-12345",
      interestCycle: "Monthly",
      repaymentMethod: "Direct Debit"
    },
    {
      id: "LN-10552",
      type: "Personal Loan",
      tenure: "5 Years",
      internalBankCode: "PL-12-Z",
      auditDate: "2023-08-20",
      branchLocation: "Westside Hub",
      managerName: "Bob Smith",
      lastUpdated: "2023-11-15",
      riskProfile: "Medium",
      currency: "USD",
      isEligibleForTopUp: false,
      insuranceProvider: "N/A",
      taxIdentifier: "TX-99881",
      interestCycle: "Monthly",
      repaymentMethod: "Wire Transfer"
    },
    {
      id: "LN-55210",
      type: "Auto Loan",
      tenure: "7 Years",
      internalBankCode: "AL-55-Q",
      auditDate: "2023-09-05",
      branchLocation: "North Station",
      managerName: "Charlie Davis",
      lastUpdated: "2023-10-25",
      riskProfile: "Low",
      currency: "USD",
      isEligibleForTopUp: true,
      insuranceProvider: "AutoGuard",
      taxIdentifier: "TX-55662",
      interestCycle: "Quarterly",
      repaymentMethod: "Check"
    }
  ];
};

export const getLoanDetails = (accountId: string): LoanDetails => {
  const detailsMap: Record<string, LoanDetails> = {
    "LN-98421": {
      tenure: "15 Years",
      interest_rate: "4.5% p.a.",
      principal_pending: "$120,000",
      interest_pending: "$12,400",
      nominee: "Sarah Parker"
    },
    "LN-10552": {
      tenure: "5 Years",
      interest_rate: "10.2% p.a.",
      principal_pending: "$15,000",
      interest_pending: "$1,200",
      nominee: "James Brown"
    },
    "LN-55210": {
      tenure: "7 Years",
      interest_rate: "6.8% p.a.",
      principal_pending: "$32,500",
      interest_pending: "$2,150",
      nominee: "Linda Davis"
    }
  };
  return detailsMap[accountId] || {
    tenure: "Unknown",
    interest_rate: "N/A",
    principal_pending: "N/A",
    interest_pending: "N/A",
    nominee: "None"
  };
};
