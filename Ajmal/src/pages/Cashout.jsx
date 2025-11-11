import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, isAuthenticated } from '../services/auth';
import './Cashout.css';

const Cashout = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [language, setLanguage] = useState('en'); // 'en' or 'ur'
  const [amount, setAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('');
  const [accountDetails, setAccountDetails] = useState('');
  const [errors, setErrors] = useState({});

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
    } else {
      setCurrentUser(getCurrentUser());
    }
  }, [navigate]);

  const content = {
    en: {
      title: 'Cashout',
      subtitle: 'Withdraw your earnings',
      availableBalance: 'Available Balance',
      infoTitle: 'Withdrawal Information',
      infoText: 'You can withdraw from $20 up to $10,000 24/7.',
      minAmount: 'Minimum: $20',
      maxAmount: 'Maximum: $10,000',
      available247: 'Available 24/7',
      amountLabel: 'Withdrawal Amount',
      amountPlaceholder: 'Enter amount ($20 - $10,000)',
      methodLabel: 'Withdrawal Method',
      methodPlaceholder: 'Select withdrawal method',
      accountLabel: 'Account Details',
      accountPlaceholder: 'Enter your account details',
      submitButton: 'Submit Withdrawal',
      methods: {
        bank: 'Bank Transfer',
        easypaisa: 'EasyPaisa',
        jazzcash: 'JazzCash',
        paypal: 'PayPal',
        crypto: 'Cryptocurrency'
      },
      languageLabel: 'اردو'
    },
    ur: {
      title: 'کیش آؤٹ',
      subtitle: 'اپنی کمائی نکالیں',
      availableBalance: 'دستیاب بیلنس',
      infoTitle: 'نکلوانے کی معلومات',
      infoText: 'آپ $20 سے لے کر $10,000 تک کسی بھی وقت، دن رات (24/7) نکال سکتے ہیں۔',
      minAmount: 'کم از کم: $20',
      maxAmount: 'زیادہ سے زیادہ: $10,000',
      available247: '24/7 دستیاب',
      amountLabel: 'نکلوانے کی رقم',
      amountPlaceholder: 'رقم درج کریں ($20 - $10,000)',
      methodLabel: 'نکلوانے کا طریقہ',
      methodPlaceholder: 'نکلوانے کا طریقہ منتخب کریں',
      accountLabel: 'اکاؤنٹ کی تفصیلات',
      accountPlaceholder: 'اپنے اکاؤنٹ کی تفصیلات درج کریں',
      submitButton: 'نکلوانے کی درخواست جمع کرائیں',
      methods: {
        bank: 'بینک ٹرانسفر',
        easypaisa: 'ایزی پیسہ',
        jazzcash: 'جاز کیش',
        paypal: 'پے پال',
        crypto: 'کرپٹو کرنسی'
      },
      languageLabel: 'English'
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    const numAmount = parseFloat(amount);

    if (!amount) {
      newErrors.amount = language === 'en' ? 'Amount is required' : 'رقم درج کرنا ضروری ہے';
    } else if (numAmount < 20) {
      newErrors.amount = language === 'en' ? 'Minimum withdrawal is $20' : 'کم از کم نکلوانا $20 ہے';
    } else if (numAmount > 10000) {
      newErrors.amount = language === 'en' ? 'Maximum withdrawal is $10,000' : 'زیادہ سے زیادہ نکلوانا $10,000 ہے';
    }

    if (!withdrawalMethod) {
      newErrors.method = language === 'en' ? 'Please select a withdrawal method' : 'براہ کرم نکلوانے کا طریقہ منتخب کریں';
    }

    if (!accountDetails) {
      newErrors.account = language === 'en' ? 'Account details are required' : 'اکاؤنٹ کی تفصیلات درج کرنا ضروری ہے';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert(language === 'en' 
        ? 'Withdrawal request submitted successfully!' 
        : 'نکلوانے کی درخواست کامیابی سے جمع ہو گئی!');
      
      // Reset form
      setAmount('');
      setWithdrawalMethod('');
      setAccountDetails('');
    }
  };

  return (
    <div className="cashout-container">
      {/* Header */}
      <header className="cashout-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn" aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="cashout-title">{content[language].title}</h1>
        <button className="language-toggle-btn" onClick={toggleLanguage}>
          <span className="language-icon">🌐</span>
          {content[language].languageLabel}
        </button>
      </header>

      {/* Main Content */}
      <main className="cashout-main">
        <div className={`cashout-content ${language === 'ur' ? 'rtl' : ''}`}>
          
          {/* Available Balance */}
          <div className="balance-display">
            <span className="balance-label">{content[language].availableBalance}</span>
            <span className="balance-amount">PKR 0.00</span>
          </div>

          {/* Info Card */}
          <div className="info-card">
            <div className="info-icon">💰</div>
            <h3 className="info-title">{content[language].infoTitle}</h3>
            <p className="info-text">{content[language].infoText}</p>
            
            <div className="info-badges">
              <span className="info-badge">
                <span className="badge-icon">📉</span>
                {content[language].minAmount}
              </span>
              <span className="info-badge">
                <span className="badge-icon">📈</span>
                {content[language].maxAmount}
              </span>
              <span className="info-badge success">
                <span className="badge-icon">⏰</span>
                {content[language].available247}
              </span>
            </div>
          </div>

          {/* Withdrawal Form */}
          <form onSubmit={handleSubmit} className="cashout-form">
            <div className="form-group">
              <label>{content[language].amountLabel}</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={content[language].amountPlaceholder}
                min="20"
                max="10000"
                step="1"
              />
              {errors.amount && <span className="error-text">{errors.amount}</span>}
            </div>

            <div className="form-group">
              <label>{content[language].methodLabel}</label>
              <select
                value={withdrawalMethod}
                onChange={(e) => setWithdrawalMethod(e.target.value)}
              >
                <option value="">{content[language].methodPlaceholder}</option>
                <option value="bank">{content[language].methods.bank}</option>
                <option value="easypaisa">{content[language].methods.easypaisa}</option>
                <option value="jazzcash">{content[language].methods.jazzcash}</option>
                <option value="paypal">{content[language].methods.paypal}</option>
                <option value="crypto">{content[language].methods.crypto}</option>
              </select>
              {errors.method && <span className="error-text">{errors.method}</span>}
            </div>

            <div className="form-group">
              <label>{content[language].accountLabel}</label>
              <textarea
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                placeholder={content[language].accountPlaceholder}
                rows="4"
              />
              {errors.account && <span className="error-text">{errors.account}</span>}
            </div>

            <button type="submit" className="submit-btn">
              {content[language].submitButton}
            </button>
          </form>

        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/dashboard')}>
          <div className="nav-icon">🏠</div>
          <span>Home</span>
        </button>
        <button className="nav-item active" onClick={() => navigate('/cashout')}>
          <div className="nav-icon">💸</div>
          <span>Cashout</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/buy-plan')}>
          <div className="nav-icon">💰</div>
          <span>Buy</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/invite')}>
          <div className="nav-icon">👥</div>
          <span>Invite</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/dashboard')}>
          <div className="nav-icon">📊</div>
          <span>Account</span>
        </button>
      </nav>
    </div>
  );
};

export default Cashout;
