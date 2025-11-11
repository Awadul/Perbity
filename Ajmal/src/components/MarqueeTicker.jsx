import React from 'react';
import './MarqueeTicker.css';

const MarqueeTicker = () => {
  const announcements = [
    '🎉 Welcome to Perbity!',
    '💰 Earn money by viewing ads',
    '🎁 Refer friends and earn bonuses',
    '⚡ Upgrade your plan for more daily ads',
    '💎 Premium plans available now'
  ];

  return (
    <div className="marquee-ticker">
      <div className="marquee-content">
        {announcements.map((text, index) => (
          <span key={index} className="marquee-item">
            {text}
          </span>
        ))}
        {/* Duplicate for seamless loop */}
        {announcements.map((text, index) => (
          <span key={`dup-${index}`} className="marquee-item">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeTicker;
