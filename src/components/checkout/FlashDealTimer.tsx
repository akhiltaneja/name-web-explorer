
import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

interface FlashDealTimerProps {
  initialMinutes?: number;
  onExpire?: () => void;
}

const FlashDealTimer = ({ initialMinutes = 10, onExpire }: FlashDealTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60); // Convert minutes to seconds
  
  useEffect(() => {
    // Check if there's a stored expiry time in session storage
    const storedExpiryTime = sessionStorage.getItem('flashDealExpiry');
    
    if (storedExpiryTime) {
      const expiryTime = parseInt(storedExpiryTime);
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = expiryTime - currentTime;
      
      // If the deal hasn't expired yet, use the remaining time
      if (remainingTime > 0) {
        setTimeLeft(remainingTime);
      } else {
        // Deal expired, set a new expiry time
        const newExpiryTime = Math.floor(Date.now() / 1000) + initialMinutes * 60;
        sessionStorage.setItem('flashDealExpiry', newExpiryTime.toString());
        setTimeLeft(initialMinutes * 60);
      }
    } else {
      // No stored expiry time, set a new one
      const expiryTime = Math.floor(Date.now() / 1000) + initialMinutes * 60;
      sessionStorage.setItem('flashDealExpiry', expiryTime.toString());
    }
    
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          if (onExpire) onExpire();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [initialMinutes, onExpire]);
  
  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  return (
    <div className="inline-flex items-center text-red-600 gap-1.5 font-semibold bg-red-50 px-3 py-1 rounded-full border border-red-200 shadow-sm">
      <Zap size={16} className="animate-pulse" />
      <span>Flash deal! Expires in <span className="font-mono">{formattedTime}</span></span>
    </div>
  );
};

export default FlashDealTimer;
