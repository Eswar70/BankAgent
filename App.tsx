
import React, { useState, useRef, useEffect } from 'react';
import { 
  Message, 
  AuthStep, 
  UserSession, 
  LoanAccount, 
  LoanDetails 
} from './types';
import { triggerOTP, getLoanAccounts, getLoanDetails } from './mockApi';
import { yellowBankService } from './geminiService';

// --- Helper Components ---

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isAgent = message.role === 'agent';
  return (
    <div className={`flex w-full mb-4 ${isAgent ? 'justify-start' : 'justify-end animate-in fade-in slide-in-from-bottom-2 duration-300'}`}>
      <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 ${isAgent ? 'chat-bubble-agent' : 'chat-bubble-user font-medium shadow-sm'}`}>
        <p className="text-[13px] sm:text-base leading-relaxed whitespace-pre-wrap">{message.text}</p>
        <p className={`text-[9px] mt-1 opacity-60 text-right ${isAgent ? 'text-slate-400' : 'text-slate-800'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

const ErrorCard: React.FC<{ code: string; onRetry: () => void }> = ({ code, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 animate-in zoom-in-95 duration-300 mx-2 shadow-sm">
    <div className="flex items-start space-x-3">
      <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
      </div>
      <div className="flex-1">
        <h4 className="text-red-800 text-xs sm:text-sm font-bold">Connection Interrupted</h4>
        <p className="text-red-600 text-[10px] sm:text-[11px] mb-3">ErrorCode: {code}</p>
        <button 
          onClick={(e) => { e.stopPropagation(); onRetry(); }}
          className="bg-red-600 text-white text-[10px] sm:text-xs px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-all shadow-sm active:scale-95 flex items-center"
        >
          <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Retry
        </button>
      </div>
    </div>
  </div>
);

const LoanCard: React.FC<{ account: LoanAccount; onSelect: (id: string) => void }> = ({ account, onSelect }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all flex-shrink-0 w-[240px] sm:w-72 mr-3 sm:mr-4 mb-4 transform hover:-translate-y-1">
    <div className="flex justify-between items-start mb-3">
      <div className="bg-yellow-100 text-yellow-700 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
        {account.type}
      </div>
      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
      </div>
    </div>
    <h3 className="font-bold text-slate-800 text-base sm:text-lg mb-1 tracking-tight">{account.id}</h3>
    <div className="flex items-center text-[10px] sm:text-xs text-slate-500 mb-5 font-medium">
      <svg className="w-3.5 h-3.5 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      Tenure: {account.tenure}
    </div>
    <button 
      onClick={(e) => { e.stopPropagation(); onSelect(account.id); }}
      className="w-full bg-slate-900 text-white text-[11px] sm:text-sm py-2.5 rounded-xl hover:bg-slate-800 active:scale-95 transition-all font-semibold shadow-sm"
    >
      Select Account
    </button>
  </div>
);

const LoanDetailsTable: React.FC<{ details: LoanDetails; onCSAT: () => void }> = ({ details, onCSAT }) => (
  <div className="flex flex-col space-y-4 mb-6 animate-in fade-in zoom-in-95 duration-500 px-1 sm:px-0">
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <h4 className="text-slate-800 font-bold text-sm sm:text-base flex items-center">
          <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
          Detailed Loan Statement
        </h4>
        <span className="text-[10px] font-black bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">Verified</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <tbody className="divide-y divide-slate-100">
            <TableRow label="Tenure" value={details.tenure} />
            <TableRow label="Interest Rate" value={details.interest_rate} highlight />
            <TableRow label="Principal Balance" value={details.principal_pending} />
            <TableRow label="Interest Pending" value={details.interest_pending} />
            <TableRow label="Registered Nominee" value={details.nominee} />
          </tbody>
        </table>
      </div>
    </div>
    <button 
      onClick={(e) => { e.stopPropagation(); onCSAT(); }}
      className="self-start px-5 py-2.5 bg-slate-800 text-white rounded-full text-[10px] sm:text-xs font-bold hover:bg-slate-700 shadow-lg hover:shadow-yellow-100 transition-all flex items-center group"
    >
      Rate our interaction
      <svg className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
    </button>
  </div>
);

const TableRow: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <tr className="hover:bg-slate-50/50 transition-colors">
    <td className="px-4 py-3 text-slate-500 font-medium whitespace-nowrap">{label}</td>
    <td className={`px-4 py-3 font-bold text-right ${highlight ? 'text-green-600' : 'text-slate-900'}`}>{value}</td>
  </tr>
);

const CSATPanel: React.FC<{ onRate: (r: string) => void }> = ({ onRate }) => (
  <div className="flex flex-col space-y-3 mb-6 px-1 sm:px-4">
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Your experience matters</p>
    <div className="flex flex-row justify-center gap-2 sm:gap-3">
      {['Good', 'Average', 'Bad'].map(rating => (
        <button
          key={rating}
          onClick={(e) => { e.stopPropagation(); onRate(rating); }}
          className="flex-1 py-2 sm:py-3 bg-white border-2 border-slate-100 rounded-xl sm:rounded-2xl text-[11px] sm:text-sm font-bold hover:border-yellow-400 hover:bg-yellow-50 transition-all shadow-sm active:scale-95"
        >
          {rating}
        </button>
      ))}
    </div>
  </div>
);

// --- Main Application ---

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);
  const [session, setSession] = useState<UserSession>({
    intent: null,
    authStep: AuthStep.NONE,
    phoneNumber: null,
    dob: null,
    generatedOtp: null,
    selectedAccountId: null
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => inputRef.current?.focus();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping, lastFailedText]);

  useEffect(() => {
    initChat();
  }, []);

  const initChat = () => {
    const welcome: Message = {
      id: 'welcome',
      role: 'agent',
      text: "Yellow Bank Super Agent online. 👋\n\nI am your unified interface for loan management, powered by Yellow.ai. How can I assist you today?",
      timestamp: new Date()
    };
    setMessages([welcome]);
  };

  const handleLogout = () => {
    setMessages([]);
    setSession({
      intent: null,
      authStep: AuthStep.NONE,
      phoneNumber: null,
      dob: null,
      generatedOtp: null,
      selectedAccountId: null
    });
    setTimeout(initChat, 100);
  };

  const addMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      focusInput();
    };

    recognition.start();
  };

  const handleAccountSelect = (id: string) => {
    setSession(prev => ({ ...prev, selectedAccountId: id }));
    handleSend(`Show details for loan ${id}`);
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    setLastFailedText(null);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    addMessage(userMsg);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text || "" }]
      }));

      const response = await yellowBankService.processMessage(textToSend, history, session);
      
      let currentAccountId = session.selectedAccountId;
      if (response.dataProjection?.accountId) {
        currentAccountId = response.dataProjection.accountId;
        setSession(prev => ({ ...prev, selectedAccountId: response.dataProjection.accountId }));
      }

      if (response.nextStep === 'TRIGGER_OTP') {
        const otp = triggerOTP();
        setSession(prev => ({ ...prev, generatedOtp: otp, authStep: AuthStep.COLLECTING_OTP }));
        console.log("%c[YAI SECURITY HUB] Generated OTP: " + otp, "color: #facc15; font-weight: bold;");
      }

      if (response.nextStep === 'VERIFY_OTP') {
        if (textToSend === session.generatedOtp) {
          setSession(prev => ({ ...prev, authStep: AuthStep.AUTHENTICATED }));
          const rawAccounts = getLoanAccounts();
          const projectedAccounts = rawAccounts.map(({ id, type, tenure }) => ({ id, type, tenure }));
          
          setTimeout(() => {
             addMessage({
               id: (Date.now() + 1).toString(),
               role: 'agent',
               text: "Identity verified. Loading your Yellow Cloud registry...",
               timestamp: new Date()
             });
             addMessage({
                id: (Date.now() + 2).toString(),
                role: 'agent',
                type: 'cards',
                data: projectedAccounts,
                timestamp: new Date()
             });
             setIsTyping(false);
          }, 1000);
          return;
        } else {
           response.reply = "The security code does not match. Please try again.";
        }
      }

      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        text: response.reply,
        timestamp: new Date()
      };

      if (response.nextStep === 'SHOW_DETAILS' && currentAccountId) {
         const details = getLoanDetails(currentAccountId);
         addMessage(agentMsg);
         addMessage({
            id: (Date.now() + 3).toString(),
            role: 'agent',
            type: 'quick-replies',
            data: details,
            timestamp: new Date()
         });
         setIsTyping(false);
         return;
      }

      if (response.nextStep === 'CSAT') {
         addMessage(agentMsg);
         addMessage({
            id: (Date.now() + 4).toString(),
            role: 'agent',
            type: 'csat',
            timestamp: new Date()
         });
         setIsTyping(false);
         return;
      }

      if (response.dataProjection?.intentClear) {
        setSession(prev => ({
          ...prev,
          authStep: AuthStep.COLLECTING_PHONE,
          phoneNumber: null,
          dob: null,
          generatedOtp: null
        }));
      }

      addMessage(agentMsg);
    } catch (error) {
      console.error(error);
      setLastFailedText(textToSend);
      addMessage({
        id: 'err-' + Date.now(),
        role: 'agent',
        text: "I encountered a communication gap with Yellow Bank core services.",
        timestamp: new Date()
      });
    } finally {
      setIsTyping(false);
      focusInput();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white sm:shadow-2xl overflow-hidden sm:my-4 sm:h-[calc(100vh-2rem)] sm:rounded-3xl border border-slate-100 transition-all duration-300">
      {/* Header */}
      <header className="bg-white px-4 sm:px-6 py-3 sm:py-5 flex items-center justify-between border-b border-slate-100 z-10 shrink-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="bg-yellow-400 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-lg shadow-yellow-100 relative shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base truncate">Yellow Super Agent</h1>
              <span className="hidden xs:inline-block bg-slate-900 text-white text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded tracking-tighter uppercase shrink-0">YAI</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center truncate">
                <span className="flex h-1.5 w-1.5 rounded-full bg-blue-400 mr-1 animate-pulse"></span>
                Secure Tunnel
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black tracking-tighter transition-all duration-500 ${session.authStep === AuthStep.AUTHENTICATED ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
            {session.authStep === AuthStep.AUTHENTICATED ? 'VERIFIED' : 'GUEST'}
          </div>
          <button 
            onClick={handleLogout}
            title="Reset Session"
            className="p-1.5 sm:p-2 text-slate-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg sm:rounded-xl"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main 
        ref={scrollRef} 
        onClick={focusInput} 
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-8 custom-scrollbar bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:20px_20px] cursor-text"
      >
        {messages.map((m) => (
          <React.Fragment key={m.id}>
            {m.text && <MessageBubble message={m} />}
            
            {m.type === 'cards' && (
              <div className="flex overflow-x-auto pb-4 mb-4 custom-scrollbar snap-x no-scrollbar pl-1">
                {(m.data as LoanAccount[]).map(acc => (
                  <div key={acc.id} className="snap-start">
                    <LoanCard account={acc} onSelect={handleAccountSelect} />
                  </div>
                ))}
              </div>
            )}

            {m.type === 'quick-replies' && (
              <LoanDetailsTable details={m.data as LoanDetails} onCSAT={() => handleSend("I want to rate our chat")} />
            )}

            {m.type === 'csat' && (
              <CSATPanel onRate={(r) => handleSend(`Rating: ${r}`)} />
            )}
          </React.Fragment>
        ))}
        {lastFailedText && (
          <ErrorCard code="YAI_COMM_ERR" onRetry={() => handleSend(lastFailedText)} />
        )}
        {isTyping && (
          <div className="flex justify-start mb-4 animate-pulse ml-1">
            <div className="bg-slate-50 rounded-2xl px-4 py-2 border border-slate-100">
              <div className="flex space-x-1.5">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-4 sm:p-6 bg-white border-t border-slate-100 shrink-0">
        <div className="relative">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className={`flex items-center space-x-2 sm:space-x-3 bg-slate-50 p-1.5 rounded-xl sm:rounded-2xl border transition-all duration-300 shadow-inner ${isListening ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-200 focus-within:border-yellow-400 focus-within:ring-4 focus-within:ring-yellow-50'}`}
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); startVoiceInput(); }}
              className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-500 flex shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-slate-400 hover:text-yellow-600 shadow-sm'}`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
            </button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onClick={(e) => { e.stopPropagation(); focusInput(); }}
              placeholder={isListening ? "Listening..." : "Message agent..."}
              className="flex-1 bg-transparent px-1 sm:px-2 py-2 sm:py-3 outline-none text-[13px] sm:text-sm font-medium placeholder:text-slate-400 min-w-0"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping || isListening}
              className="bg-yellow-400 p-2 sm:p-3 rounded-lg sm:rounded-xl text-slate-900 hover:bg-yellow-500 active:scale-90 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-yellow-100 shrink-0"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </form>
          {isListening && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 h-10 px-5 bg-white/95 rounded-full backdrop-blur-md border border-red-100 shadow-xl z-20">
              {[0, 1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="w-1 bg-red-400 rounded-full animate-bounce" style={{ height: `${30 + Math.random() * 50}%`, animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center mt-3 sm:mt-4 px-2 space-y-2 sm:space-y-0">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter text-center">
            Yellow.ai SuperAgent • Cloud 3.0
          </span>
          <div className="flex space-x-3 sm:space-x-4">
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); setInput("Check loan details"); focusInput(); }} 
              className="text-[9px] sm:text-[10px] text-yellow-600 font-bold hover:underline"
            >
              Loan Portal
            </button>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); setInput("Change my number"); focusInput(); }} 
              className="text-[9px] sm:text-[10px] text-slate-500 font-bold hover:underline"
            >
              Reset Auth
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
