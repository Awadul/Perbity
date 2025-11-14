import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import apiService from '../services/api';
import './Cashout.css';

const Cashout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppContext();
  const [language, setLanguage] = useState('en'); // 'en' or 'ur'
  const [amount, setAmount] = useState('');
  const [easypaisaPhone, setEasypaisaPhone] = useState('');
  const [easypaisaName, setEasypaisaName] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState(0);

  // Check authentication and fetch balance
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true });
      return;
    }
    fetchUserBalance();
  }, [isAuthenticated, user, navigate]);

  const fetchUserBalance = async () => {
    try {
      const response = await apiService.get('/users/profile');
      if (response.success && response.data) {
        // Use data.balance if it exists, otherwise fallback to user context
        setUserBalance(response.data.balance || user?.balance || 0);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      // Fallback to context balance if API fails
      setUserBalance(user?.balance || 0);
    }
  };

  const content = {
    en: {
      title: 'Cashout',
      subtitle: 'Withdraw your earnings',
      availableBalance: 'Available Balance',
      infoTitle: 'Withdrawal Information',
      infoText: 'You can withdraw from $50 up to $10,000. Minimum balance required: $50',
      minAmount: 'Minimum: $50',
      maxAmount: 'Maximum: $10,000',
      available247: 'Available 24/7',
      amountLabel: 'Withdrawal Amount',
      amountPlaceholder: 'Enter amount ($50 - $10,000)',
      phoneLabel: 'EasyPaisa Phone Number',
      phonePlaceholder: 'Enter your EasyPaisa phone (03XXXXXXXXX)',
      nameLabel: 'Account Holder Name',
      namePlaceholder: 'Enter name as per EasyPaisa account',
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
      infoText: 'آپ $50 سے لے کر $10,000 تک نکال سکتے ہیں۔ کم از کم بیلنس: $50',
      minAmount: 'کم از کم: $50',
      maxAmount: 'زیادہ سے زیادہ: $10,000',
      available247: '24/7 دستیاب',
      amountLabel: 'نکلوانے کی رقم',
      amountPlaceholder: 'رقم درج کریں ($50 - $10,000)',
      phoneLabel: 'ایزی پیسہ فون نمبر',
      phonePlaceholder: 'اپنا ایزی پیسہ فون نمبر درج کریں (03XXXXXXXXX)',
      nameLabel: 'اکاؤنٹ ہولڈر کا نام',
      namePlaceholder: 'ایزی پیسہ اکاؤنٹ کے مطابق نام درج کریں',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    const numAmount = parseFloat(amount);

    // Validate amount
    if (!amount) {
      newErrors.amount = language === 'en' ? 'Amount is required' : 'رقم درج کرنا ضروری ہے';
    } else if (numAmount < 50) {
      newErrors.amount = language === 'en' ? 'Minimum withdrawal is $50' : 'کم از کم نکلوانا $50 ہے';
    } else if (numAmount > 10000) {
      newErrors.amount = language === 'en' ? 'Maximum withdrawal is $10,000' : 'زیادہ سے زیادہ نکلوانا $10,000 ہے';
    } else if (numAmount > userBalance) {
      newErrors.amount = language === 'en' ? `Insufficient balance. Available: $${userBalance.toFixed(2)}` : `ناکافی بیلنس۔ دستیاب: $${userBalance.toFixed(2)}`;
    }

    // Validate phone
    if (!easypaisaPhone) {
      newErrors.phone = language === 'en' ? 'Phone number is required' : 'فون نمبر درج کرنا ضروری ہے';
    } else if (!/^03\d{9}$/.test(easypaisaPhone)) {
      newErrors.phone = language === 'en' ? 'Invalid phone format (03XXXXXXXXX)' : 'غلط فون فارمیٹ (03XXXXXXXXX)';
    }

    // Validate name
    if (!easypaisaName) {
      newErrors.name = language === 'en' ? 'Name is required' : 'نام درج کرنا ضروری ہے';
    } else if (easypaisaName.length < 3) {
      newErrors.name = language === 'en' ? 'Name must be at least 3 characters' : 'نام کم از کم 3 حروف کا ہونا چاہیے';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);
        
        const response = await apiService.post('/checkouts', {
          amount: numAmount,
          paymentMethod: 'easypaisa',
          paymentDetails: {
            phoneNumber: easypaisaPhone,
            accountHolderName: easypaisaName,
            accountName: easypaisaName
          },
          requestNote: `EasyPaisa withdrawal - ${easypaisaPhone}`
        });

        if (response.success) {
          alert(language === 'en' 
            ? 'Withdrawal request submitted successfully! Please wait for admin approval.' 
            : 'نکلوانے کی درخواست کامیابی سے جمع ہو گئی! براہ کرم ایڈمن کی منظوری کا انتظار کریں۔');
          
          // Reset form
          setAmount('');
          setEasypaisaPhone('');
          setEasypaisaName('');
          fetchUserBalance(); // Refresh balance
        }
      } catch (error) {
        console.error('Withdrawal request failed:', error);
        alert(language === 'en'
          ? error.message || 'Failed to submit withdrawal request'
          : error.message || 'نکلوانے کی درخواست جمع کرانے میں ناکامی');
      } finally {
        setLoading(false);
      }
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
            <span className="balance-amount">${userBalance.toFixed(2)}</span>
          </div>

          {/* Minimum balance warning */}
          {userBalance < 50 && (
            <div className="warning-card">
              <div className="warning-icon">⚠️</div>
              <p className="warning-text">
                {language === 'en'
                  ? `You need at least $50 to withdraw. Current balance: $${userBalance.toFixed(2)}`
                  : `نکلوانے کے لیے کم از کم $50 کی ضرورت ہے۔ موجودہ بیلنس: $${userBalance.toFixed(2)}`}
              </p>
            </div>
          )}

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
                min="50"
                max="10000"
                step="1"
                disabled={userBalance < 50}
              />
              {errors.amount && <span className="error-text">{errors.amount}</span>}
            </div>

            <div className="form-group">
              <label>{content[language].phoneLabel}</label>
              <input
                type="tel"
                value={easypaisaPhone}
                onChange={(e) => setEasypaisaPhone(e.target.value)}
                placeholder={content[language].phonePlaceholder}
                maxLength="11"
                disabled={userBalance < 50}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label>{content[language].nameLabel}</label>
              <input
                type="text"
                value={easypaisaName}
                onChange={(e) => setEasypaisaName(e.target.value)}
                placeholder={content[language].namePlaceholder}
                disabled={userBalance < 50}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={userBalance < 50 || loading}
            >
              {loading ? (language === 'en' ? 'Submitting...' : 'جمع ہو رہا ہے...') : content[language].submitButton}
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
