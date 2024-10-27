import React from 'react';

const BabbleLogo = ({ size = 40 }) => {
  const scale = size / 40; // Base size is 40px

  return (
    <div className="relative" style={{ width: `${200}px`, height: `${size}px` }}>
      <div className="absolute "></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{
          fontFamily: 'Reenie Beanie, cursive',
          color: 'white',
          fontSize: `${15 * scale}px`,
          lineHeight: 1,
          position: 'relative',
          display: 'inline-block',
          letterSpacing: `${10 * scale}px`,
        }}>
          <span style={{ 
            display: 'inline-block', 
            transform: `scale(${scale}) rotate(2deg)`,
            transformOrigin: 'bottom center',
            top: '6px',
            position: 'relative'
          }}>b</span>
          <span style={{ 
            display: 'inline-block', 
            transform: `scale(${scale}) rotate(4deg)`
          }}>a</span>
          <span style={{ 
            display: 'inline-block', 
            transform: `scale(${scale}) rotate(12deg)`
          }}>b</span>
          <span style={{ 
            display: 'inline-block', 
            transform: `scale(${scale}) rotate(16deg)`
          }}>b</span>
          <span style={{ 
            display: 'inline-block', 
            transform: `scale(${scale}) rotate(21deg)`
          }}>l</span>
          <span style={{ 
            display: 'inline-block', 
            transform: `scale(${scale}) rotate(28deg)`,
            top: '6px',
            position:'relative'
          }}>e
        </span>
        </span>
      </div>
    </div>
  );
};

export default BabbleLogo;
