import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowRight, BadgeCheck, Banknote, Check, ChevronLeft, CircleDollarSign,
  FileCheck2, FileText, Home, Info, KeyRound, LayoutDashboard, LogOut,
  Menu, ShieldCheck, Smartphone, User, UserCheck, X, Calculator, Camera,
  Clock3, AlertCircle, CheckCircle2, XCircle
} from "lucide-react";
import api from "./lib/api";

const steps = [
  { key: "verification", label: "Verification", icon: ShieldCheck },
  { key: "kyc", label: "KYC", icon: FileText },
  { key: "eligibility", label: "Eligibility", icon: BadgeCheck },
  { key: "emi", label: "Loan & EMI", icon: Calculator },
  { key: "bank", label: "Bank Account", icon: Banknote },
  { key: "declaration", label: "Declaration", icon: FileCheck2 },
  { key: "selfie", label: "Selfie", icon: Camera }
];

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/apply/*" element={<CustomerGuard><ApplicationLayout /></CustomerGuard>} />
      <Route path="/admin/*" element={<AdminGuard><AdminLayout /></AdminGuard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function Landing() {
  return (
    <div className="landing">
      <Header />
      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow"><ShieldCheck size={15} /> Simple. Secure. Transparent.</span>
          <h1>Personal finance, <span>made simple.</span></h1>
          <p>
            Apply for a personal loan online with a clear step-by-step journey,
            instant eligibility checks and transparent EMI calculations.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary btn-lg" to="/register">
              Start your application <ArrowRight size={18} />
            </Link>
            <Link className="btn btn-light btn-lg" to="/login">Sign in</Link>
          </div>
          <div className="trust-row">
            <div><CheckCircle2 size={18} /> Secure verification</div>
            <div><CheckCircle2 size={18} /> Clear loan terms</div>
            <div><CheckCircle2 size={18} /> Fast application flow</div>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card-top">
            <span>Loan estimate</span>
            <CircleDollarSign size={25} />
          </div>
          <div className="estimate">₹5,00,000</div>
          <div className="muted">Indicative loan amount</div>
          <div className="mini-grid">
            <div><span>Interest</span><strong>12% p.a.</strong></div>
            <div><span>Tenure</span><strong>24 months</strong></div>
            <div><span>Monthly EMI</span><strong>₹23,537</strong></div>
            <div><span>Processing</span><strong>2%</strong></div>
          </div>
          <div className="secure-note"><ShieldCheck size={17} /> Your information is protected</div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <span className="eyebrow">How it works</span>
          <h2>Everything you need in one flow</h2>
          <p>Complete your application through seven simple steps.</p>
        </div>
        <div className="feature-grid">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div className="feature-card" key={s.key}>
                <div className="feature-number">0{i + 1}</div>
                <Icon size={22} />
                <h3>{s.label}</h3>
                <p>{[
                  "Verify your email and phone number.",
                  "Submit your identity and address details.",
                  "Check your loan eligibility.",
                  "Choose a tenure and view EMI details.",
                  "Add the bank account for disbursement.",
                  "Accept the declaration.",
                  "Upload a selfie for final review."
                ][i]}</p>
              </div>
            );
          })}
        </div>
      </section>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="brand"><span className="brand-mark">E</span> EZFINANZ</Link>
        <nav className="desktop-nav">
          <a href="#how-it-works">How it works</a>
          <Link to="/login">Sign in</Link>
          <Link to="/register" className="btn btn-primary">Get started</Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return <footer className="footer"><div className="container footer-inner"><strong>EZFINANZ</strong><span>Personal loan application demo</span></div></footer>;
}

function CustomerGuard({ children }) {
  const token = localStorage.getItem("token");
  const user = getUser();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role === "ADMIN") return <Navigate to="/admin" replace />;
  return children;
}

function AdminGuard({ children }) {
  const token = localStorage.getItem("token");
  const user = getUser();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "ADMIN") return <Navigate to="/apply" replace />;
  return children;
}

function AuthShell({ children, title, subtitle }) {
  return (
    <div className="auth-page">
      <div className="auth-brand"><Link to="/" className="brand"><span className="brand-mark">E</span> EZFINANZ</Link></div>
      <div className="auth-layout">
        <div className="auth-promo">
          <span className="eyebrow"><ShieldCheck size={15} /> Secure loan application</span>
          <h1>Move from application to approval with clarity.</h1>
          <p>Complete your details, understand your loan terms and track every step from one dashboard.</p>
          <div className="promo-list">
            <div><BadgeCheck /> Eligibility calculation</div>
            <div><Calculator /> Transparent EMI breakdown</div>
            <div><ShieldCheck /> Secure identity verification</div>
          </div>
        </div>
        <div className="auth-card">
          <h2>{title}</h2>
          <p className="muted">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      saveAuth(data.data);
      navigate(data.data.user.role === "ADMIN" ? "/admin" : "/apply");
    } catch (err) {
      setError(errorMessage(err));
    } finally { setLoading(false); }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue your application.">
      <form onSubmit={submit} className="form">
        <Field label="Email" type="email" value={form.email} onChange={v => setForm({...form, email: v})} placeholder="you@example.com" />
        <Field label="Password" type="password" value={form.password} onChange={v => setForm({...form, password: v})} placeholder="••••••••" />
        {error && <ErrorBox text={error} />}
        <button className="btn btn-primary btn-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"} <ArrowRight size={17}/></button>
      </form>
      <div className="auth-footer">Don't have an account? <Link to="/register">Create one</Link></div>
    </AuthShell>
  );
}

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      saveAuth(data.data);
      setResult(data.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally { setLoading(false); }
  }

  if (result) {
    return (
      <AuthShell title="You're registered" subtitle="One quick verification step before your application.">
        <div className="success-panel">
          <CheckCircle2 size={42}/>
          <h3>Account created successfully</h3>
          <p>We've simulated the email verification service for this demo.</p>
          {result.demoEmailVerificationToken && (
            <div className="demo-token"><span>Demo verification token</span><code>{result.demoEmailVerificationToken}</code></div>
          )}
          <button className="btn btn-primary btn-full" onClick={() => navigate("/apply/verification")}>Continue application <ArrowRight size={17}/></button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create your account" subtitle="Start your personal loan application.">
      <form onSubmit={submit} className="form">
        <Field label="Full name" value={form.name} onChange={v => setForm({...form, name: v})} placeholder="Manoj Kumar" required />
        <div className="two-col">
          <Field label="Email" type="email" value={form.email} onChange={v => setForm({...form, email: v})} placeholder="you@example.com" required />
          <Field label="Phone" value={form.phone} onChange={v => setForm({...form, phone: v})} placeholder="9876543210" required />
        </div>
        <Field label="Password" type="password" value={form.password} onChange={v => setForm({...form, password: v})} placeholder="Minimum 8 characters" required />
        {error && <ErrorBox text={error} />}
        <button className="btn btn-primary btn-full" disabled={loading}>{loading ? "Creating account..." : "Create account"} <ArrowRight size={17}/></button>
      </form>
      <div className="auth-footer">Already registered? <Link to="/login">Sign in</Link></div>
    </AuthShell>
  );
}

function ApplicationLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand"><Link to="/" className="brand"><span className="brand-mark">E</span> EZFINANZ</Link></div>
        <div className="side-title">Your application</div>
        <nav>
          {steps.map((s, i) => {
            const Icon = s.icon;
            return <Link key={s.key} to={`/apply/${s.key}`} onClick={() => setMobileOpen(false)}><span className="side-icon"><Icon size={17}/></span><span>{i + 1}. {s.label}</span></Link>;
          })}
        </nav>
        <button className="logout-btn" onClick={logout}><LogOut size={17}/> Sign out</button>
      </aside>
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}
      <main className="main-content">
        <div className="mobile-top"><button onClick={() => setMobileOpen(true)}><Menu/></button><Link to="/" className="brand"><span className="brand-mark">E</span> EZFINANZ</Link></div>
        <Routes>
          <Route index element={<Navigate to="verification" replace />} />
          <Route path="verification" element={<Verification />} />
          <Route path="kyc" element={<KYC />} />
          <Route path="eligibility" element={<Eligibility />} />
          <Route path="emi" element={<EMI />} />
          <Route path="bank" element={<Bank />} />
          <Route path="declaration" element={<Declaration />} />
          <Route path="selfie" element={<Selfie />} />
        </Routes>
      </main>
    </div>
  );
}

function Page({ title, subtitle, children, back, next }) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Personal loan application</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="page-body">{children}</div>
      {(back || next) && <div className="page-actions">{back && <Link className="btn btn-light" to={back}><ChevronLeft size={17}/> Back</Link>}{next}</div>}
    </div>
  );
}

function Verification() {
  const user = getUser();
  const [emailToken, setEmailToken] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [loading, setLoading] = useState(false);

  async function verifyEmail() {
    try { await api.post("/auth/verify-email", { token: emailToken }); setMessage("Email verified successfully."); refreshUser(); }
    catch (e) { setMessage(errorMessage(e)); }
  }
  async function sendOtp() {
    try { const {data} = await api.post("/auth/send-phone-otp"); setDemoOtp(data.data.demoOtp || "Check your server console."); setMessage("OTP sent."); }
    catch (e) { setMessage(errorMessage(e)); }
  }
  async function verifyOtp() {
    try { await api.post("/auth/verify-phone", { otp }); setMessage("Phone verified successfully."); refreshUser(); }
    catch (e) { setMessage(errorMessage(e)); }
  }

  return (
    <Page title="Verify your account" subtitle="Both email and phone verification are required before KYC.">
      <div className="status-grid">
        <div className={`status-card ${user?.emailVerified ? "verified" : ""}`}>
          <div className="status-icon"><UserCheck/></div><div><strong>Email verification</strong><span>{user?.email || "Your email"}</span></div>
          {user?.emailVerified ? <CheckCircle2 className="status-check"/> : <span className="pill warning">Pending</span>}
        </div>
        <div className={`status-card ${user?.phoneVerified ? "verified" : ""}`}>
          <div className="status-icon"><Smartphone/></div><div><strong>Phone verification</strong><span>{user?.phone || "Your phone"}</span></div>
          {user?.phoneVerified ? <CheckCircle2 className="status-check"/> : <span className="pill warning">Pending</span>}
        </div>
      </div>

      {!user?.emailVerified && (
        <Card title="Verify email" icon={<KeyRound/>}>
          <div className="inline-form"><input value={emailToken} onChange={e => setEmailToken(e.target.value)} placeholder="Paste demo verification token" /><button className="btn btn-primary" onClick={verifyEmail}>Verify</button></div>
        </Card>
      )}
      {!user?.phoneVerified && (
        <Card title="Verify phone" icon={<Smartphone/>}>
          <div className="inline-form"><button className="btn btn-light" onClick={sendOtp}>Send OTP</button><input value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit OTP" /><button className="btn btn-primary" onClick={verifyOtp}>Verify</button></div>
          {demoOtp && <div className="demo-token"><span>Demo OTP</span><code>{demoOtp}</code></div>}
        </Card>
      )}
      {message && <InfoBox text={message}/>}
      <div className="page-actions"><Link className="btn btn-primary" to="/apply/kyc">Continue to KYC <ArrowRight size={17}/></Link></div>
    </Page>
  );
}

function KYC() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: getUser()?.name || "", dateOfBirth: "", gender: "MALE", idType: "PAN", idNumber: "", line1: "", line2: "", city: "", state: "", pincode: "" });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault(); setError("");
    const fd = new FormData();
    fd.append("fullName", form.fullName); fd.append("dateOfBirth", form.dateOfBirth); fd.append("gender", form.gender);
    fd.append("idType", form.idType); fd.append("idNumber", form.idNumber);
    fd.append("address[line1]", form.line1); fd.append("address[line2]", form.line2);
    fd.append("address[city]", form.city); fd.append("address[state]", form.state); fd.append("address[pincode]", form.pincode);
    if (file) fd.append("idDocument", file);
    try { await api.post("/kyc", fd, {headers: {"Content-Type": "multipart/form-data"}}); navigate("/apply/eligibility"); }
    catch (e) { setError(errorMessage(e)); }
  }
  return <Page title="Complete your KYC" subtitle="Tell us about yourself so we can verify your identity.">
    <form className="card form" onSubmit={submit}>
      <SectionTitle icon={<User/>} title="Personal details"/>
      <div className="two-col"><Field label="Full name" value={form.fullName} onChange={v=>setForm({...form,fullName:v})} required/><Field label="Date of birth" type="date" value={form.dateOfBirth} onChange={v=>setForm({...form,dateOfBirth:v})} required/></div>
      <div className="two-col"><SelectField label="Gender" value={form.gender} onChange={v=>setForm({...form,gender:v})} options={["MALE","FEMALE","OTHER"]}/><SelectField label="ID type" value={form.idType} onChange={v=>setForm({...form,idType:v})} options={["PAN","AADHAAR","PASSPORT","DRIVING_LICENSE"]}/></div>
      <Field label="ID number" value={form.idNumber} onChange={v=>setForm({...form,idNumber:v})} placeholder="Enter your ID number" required/>
      <SectionTitle icon={<Home/>} title="Current address"/>
      <Field label="Address line 1" value={form.line1} onChange={v=>setForm({...form,line1:v})} required/>
      <Field label="Address line 2" value={form.line2} onChange={v=>setForm({...form,line2:v})}/>
      <div className="three-col"><Field label="City" value={form.city} onChange={v=>setForm({...form,city:v})} required/><Field label="State" value={form.state} onChange={v=>setForm({...form,state:v})} required/><Field label="Pincode" value={form.pincode} onChange={v=>setForm({...form,pincode:v})} required/></div>
      <FileField label="ID document (optional)" file={file} setFile={setFile} accept=".jpg,.jpeg,.png,.webp,.pdf"/>
      {error && <ErrorBox text={error}/>}
      <button className="btn btn-primary">Save KYC & continue <ArrowRight size={17}/></button>
    </form>
  </Page>;
}

function Eligibility() {
  const navigate = useNavigate();
  const [form, setForm] = useState({monthlyIncome:"",annualIncome:"",requestedLoanAmount:"",creditScore:"750",currentDebts:"",employerName:"",designation:""});
  const [result, setResult] = useState(null); const [error,setError]=useState("");
  async function submit(e) {
    e.preventDefault(); setError("");
    try { const {data}=await api.post("/loans/eligibility", {...form, monthlyIncome:Number(form.monthlyIncome), annualIncome:Number(form.annualIncome), requestedLoanAmount:Number(form.requestedLoanAmount), creditScore:Number(form.creditScore), currentDebts:Number(form.currentDebts||0)}); setResult(data.data.eligibility); }
    catch(e){setError(errorMessage(e));}
  }
  return <Page title="Check your eligibility" subtitle="We'll use your income, credit score and existing debt for an indicative assessment.">
    <div className="split">
      <form className="card form" onSubmit={submit}>
        <SectionTitle icon={<CircleDollarSign/>} title="Financial details"/>
        <div className="two-col"><Field label="Monthly income" type="number" value={form.monthlyIncome} onChange={v=>setForm({...form,monthlyIncome:v})} placeholder="50000" required/><Field label="Annual income" type="number" value={form.annualIncome} onChange={v=>setForm({...form,annualIncome:v})} placeholder="600000"/></div>
        <div className="two-col"><Field label="Requested loan amount" type="number" value={form.requestedLoanAmount} onChange={v=>setForm({...form,requestedLoanAmount:v})} placeholder="500000" required/><Field label="CIBIL / credit score" type="number" value={form.creditScore} onChange={v=>setForm({...form,creditScore:v})} min="300" max="900" required/></div>
        <Field label="Current monthly debts" type="number" value={form.currentDebts} onChange={v=>setForm({...form,currentDebts:v})} placeholder="10000"/>
        <div className="two-col"><Field label="Employer" value={form.employerName} onChange={v=>setForm({...form,employerName:v})} placeholder="Company name"/><Field label="Designation" value={form.designation} onChange={v=>setForm({...form,designation:v})} placeholder="Software Engineer"/></div>
        {error && <ErrorBox text={error}/>}<button className="btn btn-primary">Check eligibility <ArrowRight size={17}/></button>
      </form>
      <div className="result-card">
        {!result ? <EmptyState icon={<BadgeCheck/>} title="Your result will appear here" text="Enter your financial details to see an indicative eligibility result."/> :
        <><div className={`result-icon ${result.result === "NOT_ELIGIBLE" ? "bad" : "good"}`}>{result.result === "NOT_ELIGIBLE" ? <XCircle/> : <CheckCircle2/>}</div>
        <span className="eyebrow">Eligibility result</span><h2>{pretty(result.result)}</h2><p>{result.reason}</p>
        <div className="metric-row"><span>Debt-to-income ratio</span><strong>{result.debtToIncomeRatio}%</strong></div>
        <div className="metric-row"><span>Maximum eligible amount</span><strong>₹{money(result.maxEligibleAmount)}</strong></div>
        {result.result !== "NOT_ELIGIBLE" && <button className="btn btn-primary btn-full" onClick={()=>navigate("/apply/emi")}>Continue to loan terms <ArrowRight size={17}/></button>}</>}
      </div>
    </div>
  </Page>;
}

function EMI() {
  const navigate=useNavigate();
  const [form,setForm]=useState({loanAmount:"500000",tenureMonths:"24",annualInterestRate:"12",processingFeePercent:"2",gstPercent:"18",otherCharges:"0"});
  const [terms,setTerms]=useState(null); const [error,setError]=useState("");
  async function calculate() {
    try { const {data}=await api.post("/loans/calculate", {...form, loanAmount:Number(form.loanAmount), tenureMonths:Number(form.tenureMonths), annualInterestRate:Number(form.annualInterestRate), processingFeePercent:Number(form.processingFeePercent), gstPercent:Number(form.gstPercent), otherCharges:Number(form.otherCharges)}); setTerms(data.data.terms); } catch(e){setError(errorMessage(e));}
  }
  async function select() {
    try { await api.post("/loans/select-term", {...form, loanAmount:Number(form.loanAmount), tenureMonths:Number(form.tenureMonths), annualInterestRate:Number(form.annualInterestRate), processingFeePercent:Number(form.processingFeePercent), gstPercent:Number(form.gstPercent), otherCharges:Number(form.otherCharges)}); navigate("/apply/bank"); } catch(e){setError(errorMessage(e));}
  }
  useEffect(()=>{calculate()},[]);
  return <Page title="Choose your loan terms" subtitle="Change the amount or tenure and instantly see the updated repayment details.">
    <div className="split">
      <div className="card form">
        <SectionTitle icon={<Calculator/>} title="Loan configuration"/>
        <Field label="Loan amount" type="number" value={form.loanAmount} onChange={v=>setForm({...form,loanAmount:v})}/>
        <label className="field"><span>Tenure</span><select value={form.tenureMonths} onChange={e=>setForm({...form,tenureMonths:e.target.value})}>{[6,12,18,24,36].map(x=><option key={x} value={x}>{x} months</option>)}</select></label>
        <div className="two-col"><Field label="Interest rate (% p.a.)" type="number" value={form.annualInterestRate} onChange={v=>setForm({...form,annualInterestRate:v})}/><Field label="Processing fee (%)" type="number" value={form.processingFeePercent} onChange={v=>setForm({...form,processingFeePercent:v})}/></div>
        <div className="two-col"><Field label="GST (%)" type="number" value={form.gstPercent} onChange={v=>setForm({...form,gstPercent:v})}/><Field label="Other charges" type="number" value={form.otherCharges} onChange={v=>setForm({...form,otherCharges:v})}/></div>
        <button className="btn btn-light" onClick={calculate}><Calculator size={17}/> Recalculate</button>
        {error&&<ErrorBox text={error}/>}
      </div>
      <div className="card terms-card">
        <div className="terms-hero"><span>Approx. monthly EMI</span><strong>{terms ? `₹${money(terms.monthlyEmi)}` : "—"}</strong><small>for {form.tenureMonths} months</small></div>
        {terms && <div className="metric-list">
          <div><span>Total interest</span><strong>₹{money(terms.totalInterest)}</strong></div>
          <div><span>Total repayment</span><strong>₹{money(terms.totalRepayment)}</strong></div>
          <div><span>Processing fee</span><strong>₹{money(terms.processingFee)}</strong></div>
          <div><span>GST</span><strong>₹{money(terms.gstAmount)}</strong></div>
          <div><span>Total charges</span><strong>₹{money(terms.totalCharges)}</strong></div>
          <div><span>Net disbursement</span><strong>₹{money(terms.netDisbursementAmount)}</strong></div>
          <div><span>Applicable IRR</span><strong>{terms.irr}%</strong></div>
        </div>}
        {terms && <button className="btn btn-primary btn-full" onClick={select}>Select these terms <ArrowRight size={17}/></button>}
      </div>
    </div>
  </Page>;
}

function Bank() {
  const navigate=useNavigate(); const [form,setForm]=useState({accountHolderName:getUser()?.name||"",accountNumber:"",ifscCode:"",bankName:""}); const [error,setError]=useState("");
  async function submit(e){e.preventDefault();try{await api.post("/bank-accounts",form);navigate("/apply/declaration")}catch(e){setError(errorMessage(e))}}
  return <Page title="Add your bank account" subtitle="This is where the approved loan amount will be sent.">
    <form className="card form narrow" onSubmit={submit}><SectionTitle icon={<Banknote/>} title="Bank details"/>
      <Field label="Account holder name" value={form.accountHolderName} onChange={v=>setForm({...form,accountHolderName:v})} required/>
      <Field label="Account number" value={form.accountNumber} onChange={v=>setForm({...form,accountNumber:v})} placeholder="Enter account number" required/>
      <div className="two-col"><Field label="IFSC code" value={form.ifscCode} onChange={v=>setForm({...form,ifscCode:v.toUpperCase()})} placeholder="SBIN0001234" required/><Field label="Bank name" value={form.bankName} onChange={v=>setForm({...form,bankName:v})} placeholder="State Bank of India" required/></div>
      <InfoBox text="For this demo, bank account verification is simulated."/>
      {error&&<ErrorBox text={error}/>}<button className="btn btn-primary">Save bank account <ArrowRight size={17}/></button>
    </form>
  </Page>;
}

function Declaration() {
  const navigate=useNavigate(); const [accepted,setAccepted]=useState(false); const [error,setError]=useState("");
  async function submit(){try{await api.post("/applications/declaration",{accepted});navigate("/apply/selfie")}catch(e){setError(errorMessage(e))}}
  return <Page title="Confirm your declaration" subtitle="Please read and confirm before the final identity check.">
    <div className="card declaration">
      <div className="declaration-head"><FileCheck2/><div><h3>Customer declaration</h3><p>Please confirm that the information you have provided is true and complete.</p></div></div>
      <ul><li>I confirm that the information provided in this application is accurate.</li><li>I consent to the checks required to assess my loan application.</li><li>I understand that the final decision is subject to review and verification.</li><li>I agree to the applicable loan terms and charges shown to me.</li></ul>
      <label className="checkbox"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)}/><span>I have read and accept the declaration.</span></label>
      {error&&<ErrorBox text={error}/>}<button className="btn btn-primary" disabled={!accepted} onClick={submit}>Confirm & continue <ArrowRight size={17}/></button>
    </div>
  </Page>;
}

function Selfie() {
  const [file,setFile]=useState(null); const [done,setDone]=useState(false); const [error,setError]=useState("");
  async function submit(e){e.preventDefault(); if(!file)return; const fd=new FormData();fd.append("selfie",file);try{await api.post("/applications/selfie",fd,{headers:{"Content-Type":"multipart/form-data"}});setDone(true)}catch(e){setError(errorMessage(e))}}
  if(done) return <Page title="Application submitted" subtitle="Your selfie has been submitted for final review."><div className="success-card"><div className="success-icon"><CheckCircle2/></div><h2>Waiting for admin review</h2><p>Your application is now with the EZFINANZ review team. You can sign in again to check your status.</p><Link className="btn btn-primary" to="/apply/verification">Back to application</Link></div></Page>;
  return <Page title="Final identity check" subtitle="Upload a clear selfie or photo to complete your application.">
    <form className="card selfie-card" onSubmit={submit}><div className="camera-placeholder"><Camera size={45}/><h3>Live selfie / photo verification</h3><p>Use a clear, well-lit photo showing your face.</p></div>
      <FileField label="Choose photo" file={file} setFile={setFile} accept="image/jpeg,image/png,image/webp"/>
      {error&&<ErrorBox text={error}/>}<button className="btn btn-primary" disabled={!file}>Submit for review <ArrowRight size={17}/></button>
    </form>
  </Page>;
}

function AdminLayout() {
  return <div className="admin-shell"><header className="admin-header"><Link to="/" className="brand"><span className="brand-mark">E</span> EZFINANZ</Link><div className="admin-user"><span>Administrator</span><button onClick={logout}><LogOut size={17}/></button></div></header><main className="admin-main"><Routes><Route index element={<AdminDashboard/>}/><Route path="applications/:id" element={<AdminApplication/>}/></Routes></main></div>;
}

function AdminDashboard() {
  const [apps,setApps]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  useEffect(()=>{api.get("/admin/applications").then(({data})=>setApps(data.data.applications)).catch(e=>setError(errorMessage(e))).finally(()=>setLoading(false))},[]);
  return <div className="page admin-page"><div className="admin-title"><div><span className="eyebrow">Admin dashboard</span><h1>Loan applications</h1><p>Review customer applications and final identity verification.</p></div><div className="admin-stat"><span>Total applications</span><strong>{apps.length}</strong></div></div>
    {error&&<ErrorBox text={error}/>}<div className="table-card"><div className="table-wrap"><table><thead><tr><th>Applicant</th><th>Loan amount</th><th>Tenure</th><th>Stage</th><th>Selfie</th><th>Submitted</th><th></th></tr></thead><tbody>{loading?<tr><td colSpan="7"><Loading/></td></tr>:apps.length===0?<tr><td colSpan="7"><EmptyState icon={<FileText/>} title="No applications yet" text="Customer applications will appear here."/></td></tr>:apps.map(a=><tr key={a._id}><td><strong>{a.user?.name||"—"}</strong><small>{a.user?.email||""}</small></td><td>₹{money(a.financial?.requestedLoanAmount)}</td><td>{a.loanTerms?.tenureMonths||"—"} mo</td><td><span className="pill">{pretty(a.stage)}</span></td><td>{a.selfie?.status||"—"}</td><td>{new Date(a.createdAt).toLocaleDateString()}</td><td><Link className="table-link" to={`/admin/applications/${a._id}`}>Review <ArrowRight size={15}/></Link></td></tr>)}</tbody></table></div></div>
  </div>;
}

function AdminApplication() {
  const {id}=useParamsSafe(); const [app,setApp]=useState(null); const [error,setError]=useState("");
  async function load(){try{const {data}=await api.get(`/admin/applications/${id}`);setApp(data.data.application)}catch(e){setError(errorMessage(e))}}
  useEffect(()=>{load()},[id]);
  async function review(action){const reason=action==="REJECT"?window.prompt("Rejection reason:"):"";if(action==="REJECT"&&!reason)return;try{await api.patch(`/admin/applications/${id}/selfie`,{action,reason});load()}catch(e){setError(errorMessage(e))}}
  async function disburse(){try{await api.patch(`/admin/applications/${id}/disbursement`);load()}catch(e){setError(errorMessage(e))}}
  if(error)return <div className="page"><ErrorBox text={error}/></div>;
  if(!app)return <div className="page"><Loading/></div>;
  return <div className="page admin-detail"><Link className="back-link" to="/admin"><ChevronLeft size={16}/> Back to applications</Link><div className="detail-title"><div><span className="eyebrow">Application review</span><h1>{app.user?.name}</h1><p>{app.user?.email} · {app.user?.phone}</p></div><span className="pill large">{pretty(app.stage)}</span></div>
    <div className="detail-grid">
      <DetailCard title="Verification" icon={<ShieldCheck/>}><InfoRow label="Email" value={app.user?.emailVerified?"Verified":"Pending"}/><InfoRow label="Phone" value={app.user?.phoneVerified?"Verified":"Pending"}/></DetailCard>
      <DetailCard title="KYC" icon={<FileText/>}><InfoRow label="Full name" value={app.kyc?.fullName}/><InfoRow label="ID type" value={app.kyc?.idType}/><InfoRow label="ID number" value={app.kyc?.idNumber}/><InfoRow label="City" value={app.kyc?.address?.city}/></DetailCard>
      <DetailCard title="Eligibility" icon={<BadgeCheck/>}><InfoRow label="Result" value={pretty(app.eligibility?.result)}/><InfoRow label="Credit score" value={app.financial?.creditScore}/><InfoRow label="DTI" value={`${app.eligibility?.debtToIncomeRatio || 0}%`}/><InfoRow label="Max eligible" value={`₹${money(app.eligibility?.maxEligibleAmount)}`}/></DetailCard>
      <DetailCard title="Loan terms" icon={<Calculator/>}><InfoRow label="Amount" value={`₹${money(app.loanTerms?.loanAmount)}`}/><InfoRow label="Tenure" value={`${app.loanTerms?.tenureMonths || "—"} months`}/><InfoRow label="EMI" value={`₹${money(app.loanTerms?.monthlyEmi)}`}/><InfoRow label="IRR" value={`${app.loanTerms?.irr || 0}%`}/></DetailCard>
      <DetailCard title="Bank account" icon={<Banknote/>}><InfoRow label="Holder" value={app.bankAccount?.accountHolderName}/><InfoRow label="Bank" value={app.bankAccount?.bankName}/><InfoRow label="IFSC" value={app.bankAccount?.ifscCode}/><InfoRow label="Account" value={mask(app.bankAccount?.accountNumber)}/></DetailCard>
      <DetailCard title="Declaration" icon={<FileCheck2/>}><InfoRow label="Accepted" value={app.declaration?.accepted?"Yes":"No"}/><InfoRow label="Accepted at" value={app.declaration?.acceptedAt?new Date(app.declaration.acceptedAt).toLocaleString():"—"}/></DetailCard>
    </div>
    <div className="card review-card"><div className="card-title"><Camera/><div><h3>Selfie review</h3><p>Final identity verification before disbursement.</p></div></div><div className="review-status"><span className={`pill ${app.selfie?.status==="APPROVED"?"success":app.selfie?.status==="REJECTED"?"danger":"warning"}`}>{app.selfie?.status||"PENDING"}</span>{app.selfie?.rejectionReason&&<span>{app.selfie.rejectionReason}</span>}</div><div className="review-actions">{app.selfie?.status==="PENDING"&&<><button className="btn btn-primary" onClick={()=>review("APPROVE")}><Check size={17}/> Approve selfie</button><button className="btn btn-danger" onClick={()=>review("REJECT")}><X size={17}/> Reject</button></>}{app.selfie?.status==="APPROVED"&&app.disbursement?.status!=="CONFIRMED"&&<button className="btn btn-primary" onClick={disburse}><Banknote size={17}/> Confirm disbursement</button>}{app.disbursement?.status==="CONFIRMED"&&<span className="approved-note"><CheckCircle2/> Disbursement confirmed</span>}</div></div>
  </div>;
}

function Card({title,icon,children}){return <div className="card"><SectionTitle icon={icon} title={title}/>{children}</div>}
function DetailCard({title,icon,children}){return <div className="card detail-card"><SectionTitle icon={icon} title={title}/>{children}</div>}
function SectionTitle({icon,title}){return <div className="section-title">{icon}<div><h3>{title}</h3></div></div>}
function InfoRow({label,value}){return <div className="info-row"><span>{label}</span><strong>{value||"—"}</strong></div>}
function Field({label,type="text",value,onChange,placeholder,required,...props}){return <label className="field"><span>{label}{required&&" *"}</span><input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required} {...props}/></label>}
function SelectField({label,value,onChange,options}){return <label className="field"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o}>{o}</option>)}</select></label>}
function FileField({label,file,setFile,accept}){return <label className="file-field"><span>{label}</span><input type="file" accept={accept} onChange={e=>setFile(e.target.files?.[0]||null)}/><div className="file-drop"><FileText size={22}/><div><strong>{file?file.name:"Choose a file"}</strong><small>JPG, PNG, WEBP or PDF · Max 5MB</small></div></div></label>}
function ErrorBox({text}){return <div className="alert error"><AlertCircle size={18}/><span>{text}</span></div>}
function InfoBox({text}){return <div className="alert info"><Info size={18}/><span>{text}</span></div>}
function EmptyState({icon,title,text}){return <div className="empty-state">{icon}<h3>{title}</h3><p>{text}</p></div>}
function Loading(){return <div className="loading"><span></span><span></span><span></span></div>}

function getUser(){try{return JSON.parse(localStorage.getItem("user")||"null")}catch{return null}}
function saveAuth(data){localStorage.setItem("token",data.token);localStorage.setItem("user",JSON.stringify(data.user))}
function refreshUser(){ /* JWT user state is refreshed on next login; pages use stored data for demo */ }
function logout(){localStorage.removeItem("token");localStorage.removeItem("user");window.location.href="/login"}
function errorMessage(err){return err?.response?.data?.message || err?.message || "Something went wrong"}
function pretty(s){return String(s||"").toLowerCase().replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}
function money(n){return Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:2})}
function mask(s){if(!s)return "—";return "•••• •••• "+String(s).slice(-4)}
function useParamsSafe(){const path=useLocation().pathname.split("/");return {id:path[path.length-1]}}

export default App;
