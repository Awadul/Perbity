import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './BuyPlan.css';

const BuyPlan = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppContext();
  const [language, setLanguage] = useState('en');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    fetchUserProfile();
  }, [isAuthenticated, user, navigate]);

  const fetchUserProfile = async () => {
    try {
      const apiService = (await import('../services/api')).default;
      const response = await apiService.get('/users/profile');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasActivePackage = userProfile?.activePayment?.isActive;
  const currentPackageAmount = userProfile?.activePayment?.plan?.price || 0;

  const content = {
    en: {
      title: hasActivePackage ? 'Upgrade Investment Plan' : 'Buy Investment Plan',
      subtitle: hasActivePackage ? 'Upgrade to a higher investment plan and increase your daily profits' : 'Choose your investment amount and start earning daily profits',
      planHeader: hasActivePackage ? 'Available Upgrades' : 'Investment Plans',
      amount: 'Amount (USD)',
      dailyProfit: 'Daily Profit (USD)',
      dailyReturn: '% Daily Return',
      selectBtn: 'Select Plan',
      selectedBtn: 'Selected',
      bonus: 'Bonus',
      bonusText: '$10 per $100 invested',
      features: 'Plan Features',
      feature1: '3% daily guaranteed return',
      feature2: 'Instant activation after payment',
      feature3: 'Withdraw anytime 24/7',
      feature4: 'Bonus rewards on deposits',
      feature5: 'Real-time profit tracking',
      howItWorks: 'How It Works',
      step1Title: '1. Select a Plan',
      step1Desc: 'Choose an investment amount that suits your budget',
      step2Title: '2. Make Payment',
      step2Desc: 'Complete the payment securely through your preferred method',
      step3Title: '3. Start Earning',
      step3Desc: 'Your plan activates instantly and starts generating daily profits',
      step4Title: '4. Withdraw Profits',
      step4Desc: 'Withdraw your earnings anytime through the Cashout page',
      continueBtn: 'Continue to Payment',
      cancelBtn: 'Cancel',
      currentPackage: 'Current Package',
      upgradeFrom: 'Upgrading From',
      upgradeTo: 'Upgrading To',
      additionalInvestment: 'Additional Investment',
      modalTitle: hasActivePackage ? 'Confirm Package Upgrade' : 'Confirm Investment Plan',
      modalAmount: 'Investment Amount',
      modalDaily: 'Daily Profit',
      modalReturn: 'Daily Return Rate',
      modalBonus: 'Sign-up Bonus',
      modalReferredBonus: 'Buyer Bonus (Referred)',
      modalTotal: 'Total Investment Value'
    },
    ur: {
      title: hasActivePackage ? 'سرمایہ کاری پلان اپ گریڈ کریں' : 'سرمایہ کاری پلان خریدیں',
      subtitle: hasActivePackage ? 'اعلیٰ سرمایہ کاری پلان میں اپ گریڈ کریں اور اپنا روزانہ منافع بڑھائیں' : 'اپنی سرمایہ کاری کی رقم منتخب کریں اور روزانہ منافع کمانا شروع کریں',
      planHeader: hasActivePackage ? 'دستیاب اپ گریڈز' : 'سرمایہ کاری پلانز',
      amount: 'رقم (USD)',
      dailyProfit: 'روزانہ منافع (USD)',
      dailyReturn: '% روزانہ واپسی',
      selectBtn: 'پلان منتخب کریں',
      selectedBtn: 'منتخب شدہ',
      bonus: 'بونس',
      bonusText: '$100 میں $10 بونس',
      features: 'پلان کی خصوصیات',
      feature1: '3% یقینی روزانہ منافع',
      feature2: 'ادائیگی کے بعد فوری فعالیت',
      feature3: 'کسی بھی وقت نکالیں 24/7',
      feature4: 'جمع پر بونس انعامات',
      feature5: 'حقیقی وقت میں منافع ٹریکنگ',
      howItWorks: 'یہ کیسے کام کرتا ہے',
      step1Title: '1. پلان منتخب کریں',
      step1Desc: 'اپنے بجٹ کے مطابق سرمایہ کاری کی رقم منتخب کریں',
      step2Title: '2. ادائیگی کریں',
      step2Desc: 'اپنی پسندیدہ طریقہ سے محفوظ طریقے سے ادائیگی مکمل کریں',
      step3Title: '3. کمائی شروع کریں',
      step3Desc: 'آپ کا پلان فوری طور پر فعال ہو جاتا ہے اور روزانہ منافع پیدا کرنا شروع کر دیتا ہے',
      step4Title: '4. منافع نکالیں',
      step4Desc: 'کیش آؤٹ صفحہ کے ذریعے کسی بھی وقت اپنی آمدنی نکالیں',
      continueBtn: 'ادائیگی کی طرف جاری رکھیں',
      cancelBtn: 'منسوخ کریں',
      modalTitle: 'سرمایہ کاری پلان کی تصدیق کریں',
      modalAmount: 'سرمایہ کاری کی رقم',
      modalDaily: 'روزانہ منافع',
      modalReturn: 'روزانہ واپسی کی شرح',
      modalBonus: 'سائن اپ بونس',
      modalReferredBonus: 'خریدار بونس (حوالہ)',
      modalTotal: 'کل سرمایہ کاری کی قیمت'
    }
  };

  // Investment plans data from the image
  const allPlans = [
    { amount: 50, dailyProfit: 1.5, dailyReturn: 3, adsIncluded: 1 },
    { amount: 100, dailyProfit: 3, dailyReturn: 3 },
    { amount: 200, dailyProfit: 6, dailyReturn: 3 },
    { amount: 300, dailyProfit: 9, dailyReturn: 3 },
    { amount: 400, dailyProfit: 12, dailyReturn: 3 },
    { amount: 500, dailyProfit: 15, dailyReturn: 3 },
    { amount: 600, dailyProfit: 18, dailyReturn: 3 },
    { amount: 700, dailyProfit: 21, dailyReturn: 3 },
    { amount: 800, dailyProfit: 24, dailyReturn: 3 },
    { amount: 900, dailyProfit: 27, dailyReturn: 3 },
    { amount: 1000, dailyProfit: 30, dailyReturn: 3 }
  ];

  // Filter plans - only show higher amounts if user has active package
  const investmentPlans = hasActivePackage 
    ? allPlans.filter(plan => plan.amount > currentPackageAmount)
    : allPlans;

  const calculateBonus = (amount) => {
    return (amount / 100) * 10;
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleContinueToPayment = () => {
    // Navigate to payment instructions page with selected plan details
    const paymentData = {
      plan: selectedPlan,
      isUpgrade: hasActivePackage,
      currentPackage: hasActivePackage ? {
        amount: currentPackageAmount,
        dailyProfit: userProfile.activePayment.plan.dailyProfit || (currentPackageAmount * 0.03),
        paymentId: userProfile.activePayment._id
      } : null
    };
    navigate('/payment-instructions', { state: paymentData });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const t = content[language];

  return (
    <div className={`buy-plan-page ${language === 'ur' ? 'rtl' : ''}`}>
      {/* Header */}
      <div className="buy-plan-header">
        <button 
          className="back-btn" 
          onClick={() => navigate('/dashboard')}
        >
          {language === 'ur' ? '←' : '→'}
        </button>
        <h1>{t.title}</h1>
        <button 
          className="lang-toggle"
          onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
        >
          {language === 'en' ? 'اردو' : 'Eng'}
        </button>
      </div>

      <div className="buy-plan-content">
        <p className="subtitle">{t.subtitle}</p>

        {/* Bonus Information Banner */}
        <div className="bonus-info-section">
          <div className="bonus-header">
            <span className="bonus-icon">🎁</span>
            <h3>Earn Bonus Rewards!</h3>
          </div>
          
          <div className="bonus-cards">
            <div className="bonus-card">
              <div className="bonus-card-icon">👥</div>
              <div className="bonus-card-content">
                <h4>Invite Friends</h4>
                <p className="bonus-amount">$20 Per Referral</p>
                <span className="bonus-desc">Earn $20 when someone signs up using your referral link</span>
              </div>
            </div>
            
            <div className="bonus-card">
              <div className="bonus-card-icon">💎</div>
              <div className="bonus-card-content">
                <h4>Referral Rewards</h4>
                <p className="bonus-amount">10% Commission</p>
                <span className="bonus-desc">Earn 10% when your referrals purchase investment packages</span>
              </div>
            </div>
          </div>
          
          <div className="bonus-note">
            <span className="note-icon">ℹ️</span>
            <p>All bonuses are added instantly to your account balance and can be withdrawn anytime!</p>
          </div>
        </div>

        {/* Current Package Info (for upgrades) */}
        {hasActivePackage && (
          <div className="current-package-section">
            <h3>📦 Current Active Package</h3>
            <div className="current-package-card">
              <div className="package-row">
                <span>Investment Amount:</span>
                <strong>${currentPackageAmount}</strong>
              </div>
              <div className="package-row">
                <span>Daily Profit:</span>
                <strong className="highlight">${(userProfile.activePayment.plan.dailyProfit || (currentPackageAmount * 0.03)).toFixed(2)}</strong>
              </div>
              <div className="package-row">
                <span>Status:</span>
                <span className="status-badge active">Active</span>
              </div>
            </div>
            <p className="upgrade-note">💡 Select a higher investment plan below to upgrade</p>
          </div>
        )}

        {/* Investment Plans Table */}
        <div className="plans-section">
          <h2>{t.planHeader}</h2>
          {hasActivePackage && investmentPlans.length === 0 && (
            <div className="no-upgrades-message">
              <div className="no-upgrades-icon">🎉</div>
              <h3>You're on the Maximum Plan!</h3>
              <p>You're already on the highest investment package available.</p>
            </div>
          )}
          {investmentPlans.length > 0 && (
            <div className="plans-table-container">
              <table className="plans-table">
                <thead>
                  <tr>
                    <th>{t.amount}</th>
                    <th>{t.dailyProfit}</th>
                    <th>{t.dailyReturn}</th>
                    <th>Bonus</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {investmentPlans.map((plan, index) => (
                    <tr key={index} className={selectedPlan?.amount === plan.amount ? 'selected-row' : ''}>
                      <td>${plan.amount}</td>
                      <td>${plan.dailyProfit}</td>
                      <td>{plan.dailyReturn}%</td>
                      <td>
                        {plan.adsIncluded ? (
                          <span className="ads-badge">🎯 {plan.adsIncluded} Ad</span>
                        ) : (
                          <span className="no-ads">-</span>
                        )}
                      </td>
                      <td>
                        <button
                          className={`select-plan-btn ${selectedPlan?.amount === plan.amount ? 'selected' : ''}`}
                          onClick={() => handleSelectPlan(plan)}
                        >
                          {selectedPlan?.amount === plan.amount ? t.selectedBtn : t.selectBtn}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="features-section">
          <h2>{t.features}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">📈</span>
              <p>{t.feature1}</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⚡</span>
              <p>{t.feature2}</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💰</span>
              <p>{t.feature3}</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🎁</span>
              <p>{t.feature4}</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📊</span>
              <p>{t.feature5}</p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="how-it-works-section">
          <h2>{t.howItWorks}</h2>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>{t.step1Title}</h3>
              <p>{t.step1Desc}</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>{t.step2Title}</h3>
              <p>{t.step2Desc}</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>{t.step3Title}</h3>
              <p>{t.step3Desc}</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>{t.step4Title}</h3>
              <p>{t.step4Desc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedPlan && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{t.modalTitle}</h2>
            <div className="modal-details">
              {hasActivePackage && (
                <>
                  <div className="modal-row upgrade-from">
                    <span className="modal-label">Current Package:</span>
                    <span className="modal-value">${currentPackageAmount}</span>
                  </div>
                  <div className="modal-row upgrade-to">
                    <span className="modal-label">New Package:</span>
                    <span className="modal-value highlight">${selectedPlan.amount}</span>
                  </div>
                  <div className="modal-row additional-investment">
                    <span className="modal-label">Additional Investment:</span>
                    <span className="modal-value additional">${selectedPlan.amount - currentPackageAmount}</span>
                  </div>
                  <div className="modal-divider"></div>
                </>
              )}
              <div className="modal-row">
                <span className="modal-label">{hasActivePackage ? 'New Package Amount' : t.modalAmount}:</span>
                <span className="modal-value">${selectedPlan.amount}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">{t.modalDaily}:</span>
                <span className="modal-value highlight">${selectedPlan.dailyProfit}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">{t.modalReturn}:</span>
                <span className="modal-value">{selectedPlan.dailyReturn}%</span>
              </div>
              {selectedPlan.adsIncluded && (
                <div className="modal-row ads-bonus-row">
                  <span className="modal-label">🎯 Ads Included:</span>
                  <span className="modal-value ads-bonus">{selectedPlan.adsIncluded} Ad Credit</span>
                </div>
              )}
              <div className="modal-row total-row">
                <span className="modal-label">{t.modalTotal}:</span>
                <span className="modal-value total">${selectedPlan.amount}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                {t.cancelBtn}
              </button>
              <button className="continue-btn" onClick={handleContinueToPayment}>
                {t.continueBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Spacer */}
      <div className="bottom-spacer"></div>
    </div>
  );
};

export default BuyPlan;
