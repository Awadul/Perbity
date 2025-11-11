import React, { useState } from 'react';
import './WelcomeModal.css';

const WelcomeModal = ({ isOpen, onClose, username }) => {
  const [language, setLanguage] = useState('en'); // 'en' or 'ur'

  const content = {
    en: {
      title: 'Welcome to Quotex Stock!',
      message: `Inspired by the teachings of David Ogilvy, Quotex Stock offers you an easy and transparent way to earn money! Here, you can increase your earnings by watching sponsored ads. By investing $100 to $1000, you receive a 3% daily profit along with a one-time bonus of $10 for every $100. High-quality ads, following Ogilvy's principles, attract attention and boost revenue. Start small, watch ads daily, and grow your income — this is truly an easy and reliable way to earn!`,
      buttonText: 'Get Started',
      languageLabel: 'اردو'
    },
    ur: {
      title: 'Quotex Stock میں خوش آمدید!',
      message: `David Ogilvy کی تعلیمات سے متاثر ہو کر، Quotex Stock آپ کے لیے ایک آسان اور شفاف طریقہ پیش کرتا ہے پیسہ کمانے کا! یہاں آپ sponsored ads دیکھ کر اپنی کمائی بڑھا سکتے ہیں۔ $100 سے $1000 تک سرمایہ کاری پر آپ کو روزانہ 3% منافع اور ہر $100 پر $10 کا ایک بار کا بونس ملتا ہے۔ معیاری اشتہارات اوگیلوی کے اصولوں کے مطابق توجہ کھینچتے ہیں اور آمدنی بڑھاتے ہیں۔ چھوٹے سے شروع کریں، روزانہ ads دیکھیں اور اپنی کمائی کو بڑھائیں — یہ واقعی آسان اور قابل اعتماد طریقہ ہے!`,
      buttonText: 'شروع کریں',
      languageLabel: 'English'
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="language-toggle" onClick={toggleLanguage}>
          <span className="language-icon">🌐</span>
          {content[language].languageLabel}
        </button>

        <div className={`modal-body ${language === 'ur' ? 'rtl' : ''}`}>
          <div className="modal-icon">🎉</div>
          
          <h2 className="modal-title">
            {username && (
              <span className="welcome-user">
                {language === 'en' ? 'Welcome, ' : 'خوش آمدید، '}
                <span className="username-highlight">{username}</span>!
              </span>
            )}
          </h2>

          <h3 className="modal-heading">{content[language].title}</h3>

          <p className="modal-message">
            {content[language].message}
          </p>

          <button className="modal-button" onClick={onClose}>
            {content[language].buttonText}
          </button>
        </div>

        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;
