
import React, { useState, useEffect } from "react";
import { ClockIcon } from "lucide-react";

const CountdownTimer = () => {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    // Function to calculate time until midnight UTC
    const calculateTimeUntilMidnight = () => {
      const now = new Date();
      
      // Create a new Date object for the next midnight in UTC
      const tomorrow = new Date();
      tomorrow.setUTCHours(24, 0, 0, 0);
      
      // Calculate the difference in milliseconds
      const diff = tomorrow.getTime() - now.getTime();
      
      // Calculate hours, minutes, and seconds
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      // Format the time string
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Update the timer immediately
    setTimeRemaining(calculateTimeUntilMidnight());
    
    // Set up an interval to update the timer every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeUntilMidnight());
    }, 1000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center text-red-600 gap-1.5 font-semibold bg-red-50 px-3 py-1 rounded-full border border-red-200 shadow-sm">
      <ClockIcon size={16} className="animate-pulse" />
      <span>Resets in <span className="font-mono">{timeRemaining}</span></span>
    </div>
  );
};

export default CountdownTimer;
