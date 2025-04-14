
import { useEffect, useState } from 'react';

const Confetti = () => {
  const [pieces, setPieces] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50'];
    const confettiPieces = [];
    
    // Create confetti pieces
    for (let i = 0; i < 100; i++) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const size = Math.random() * 10 + 5;
      const animationDuration = Math.random() * 3 + 2;
      const animationDelay = Math.random();
      
      confettiPieces.push(
        <div
          key={i}
          className="absolute"
          style={{
            left: `${left}%`,
            top: '-20px',
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: randomColor,
            borderRadius: '50%',
            animation: `confetti ${animationDuration}s ease-in ${animationDelay}s forwards`,
          }}
        />
      );
    }
    
    setPieces(confettiPieces);
    
    // Add CSS animation to the document
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes confetti {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Clean up
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces}
    </div>
  );
};

export default Confetti;
