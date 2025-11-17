import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import apiService from '../services/api';
import './PaymentInstructions.css';

const PaymentInstructions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAppContext();
  const [accountName, setAccountName] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const selectedPlan = location.state?.plan;
  const isUpgrade = location.state?.isUpgrade || false;
  const currentPackage = location.state?.currentPackage || null;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    if (!selectedPlan) {
      navigate('/buy-plan');
      return;
    }
  }, [isAuthenticated, user, selectedPlan, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, proof: 'Please upload an image file' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, proof: 'Image size should be less than 5MB' });
        return;
      }

      setProofImage(file);
      setErrors({ ...errors, proof: null });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!accountName) {
      newErrors.accountName = 'Account name is required';
    } else if (accountName.length < 3) {
      newErrors.accountName = 'Account name must be at least 3 characters';
    }

    if (!proofImage) {
      newErrors.proof = 'Payment proof is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('planId', selectedPlan.planId || 'custom');
        formData.append('amount', selectedPlan.amount);
        formData.append('accountName', accountName);
        formData.append('proofImage', proofImage);
        formData.append('isUpgrade', isUpgrade);
        if (isUpgrade && currentPackage) {
          formData.append('previousPaymentId', currentPackage.paymentId);
          formData.append('previousAmount', currentPackage.amount);
        }
        formData.append('note', isUpgrade 
          ? `Package upgrade from $${currentPackage?.amount} to $${selectedPlan.amount} - New daily profit $${selectedPlan.dailyProfit}`
          : `Investment plan $${selectedPlan.amount} - Daily profit $${selectedPlan.dailyProfit}`);

        const response = await apiService.upload('/payments/submit', formData);

        if (response.success) {
          alert(isUpgrade 
            ? 'Upgrade request submitted successfully! Your package will be upgraded once admin approves your payment.'
            : 'Payment submitted successfully! Your plan will be activated once admin approves your payment.');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Payment submission failed:', error);
        alert(error.message || 'Failed to submit payment. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (!selectedPlan) {
    return null;
  }

  return (
    <div className="payment-instructions-page">
      {/* Header */}
      <header className="payment-header">
        <button onClick={() => navigate('/buy-plan')} className="back-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1>{isUpgrade ? 'Package Upgrade Instructions' : 'Payment Instructions'}</h1>
      </header>

      <div className="payment-content">
        {/* Current Package Info (for upgrades) */}
        {isUpgrade && currentPackage && (
          <div className="upgrade-info-card">
            <h2>🔄 Upgrade Details</h2>
            <div className="upgrade-comparison">
              <div className="package-column current">
                <h3>Current Package</h3>
                <div className="package-amount">${currentPackage.amount}</div>
                <div className="package-profit">Daily: ${currentPackage.dailyProfit.toFixed(2)}</div>
              </div>
              <div className="arrow-column">
                <div className="upgrade-arrow">→</div>
              </div>
              <div className="package-column new">
                <h3>New Package</h3>
                <div className="package-amount highlight">${selectedPlan.amount}</div>
                <div className="package-profit">Daily: ${selectedPlan.dailyProfit.toFixed(2)}</div>
              </div>
            </div>
            <div className="additional-payment">
              <span>Additional Payment Required:</span>
              <strong className="additional-amount">${selectedPlan.amount - currentPackage.amount}</strong>
            </div>
          </div>
        )}

        {/* Plan Summary */}
        <div className="plan-summary-card">
          <h2>📦 Selected Plan</h2>
          <div className="plan-details">
            <div className="plan-row">
              <span>Investment Amount:</span>
              <strong>${selectedPlan.amount}</strong>
            </div>
            <div className="plan-row">
              <span>Daily Profit:</span>
              <strong className="highlight">${selectedPlan.dailyProfit}</strong>
            </div>
            <div className="plan-row">
              <span>Daily Return:</span>
              <strong>{selectedPlan.dailyReturn}%</strong>
            </div>
          </div>
        </div>

        {/* Payment Instructions Image */}
        <div className="instructions-card">
          <h2>💰 Binance Payment Instructions</h2>
          <div className="instructions-image-wrapper">
            <img 
              src="/binance_instruction.jpg" 
              alt="Binance Payment Instructions" 
              className="instructions-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="instructions-placeholder" style={{display: 'none'}}>
              <div className="placeholder-icon">💰</div>
              <h3>Binance Payment Instructions</h3>
              <div className="instruction-steps">
                <p>1. Open your Binance app and scan the QR code above</p>
                <p>2. Send <strong>${selectedPlan.amount} USDT</strong> to the wallet address</p>
                <p>3. Complete the payment in your Binance app</p>
                <p>4. Take a screenshot of the transaction confirmation</p>
                <p>5. Enter your Binance account name or transaction ID below</p>
                <p>6. Upload the payment proof screenshot</p>
                <p>7. Submit for verification</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label htmlFor="accountName">Binance Account Name / Transaction ID *</label>
            <input
              type="text"
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Enter your Binance account name or TxID"
              disabled={loading}
            />
            {errors.accountName && <span className="error-text">{errors.accountName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="proofImage">Payment Proof (Screenshot/Photo) *</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="proofImage"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="file-select-btn"
                onClick={() => document.getElementById('proofImage').click()}
                disabled={loading}
              >
                <span className="file-icon">📎</span>
                {proofImage ? proofImage.name : 'Choose File'}
              </button>
            </div>
            {errors.proof && <span className="error-text">{errors.proof}</span>}
            
            {proofPreview && (
              <div className="image-preview">
                <img src={proofPreview} alt="Payment Proof Preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => {
                    setProofImage(null);
                    setProofPreview(null);
                  }}
                >
                  ✕ Remove
                </button>
              </div>
            )}
          </div>

          <button type="submit" className="submit-payment-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Payment'}
          </button>
        </form>

        {/* Important Notes */}
        <div className="notes-card">
          <h3>⚠️ Important Notes</h3>
          <ul>
            <li>Payment must be made via Binance USDT (TRC20 or BEP20)</li>
            <li>Scan the QR code with your Binance app to pay</li>
            <li>Upload a clear screenshot of your transaction confirmation</li>
            <li>Your plan will be activated within 24 hours after verification</li>
            <li>Keep your transaction ID (TxID) for reference</li>
            <li>Contact support if you face any issues</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentInstructions;
