
import { Link } from "react-router-dom";

interface GuestLimitWarningProps {
  user: any;
  guestCheckAvailable: boolean;
  isSearching: boolean;
}

const GuestLimitWarning = ({ user, guestCheckAvailable, isSearching }: GuestLimitWarningProps) => {
  if (user || guestCheckAvailable || isSearching) return null;
  
  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-fade-in">
      <p className="text-blue-700">
        You've used your 3 daily searches. <Link to="/auth" className="font-bold underline hover:text-blue-800">Sign in</Link> to continue searching (3 searches per day with a free account).
      </p>
    </div>
  );
};

export default GuestLimitWarning;
