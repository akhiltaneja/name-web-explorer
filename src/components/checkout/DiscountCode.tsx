
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Check, X } from "lucide-react";

interface DiscountCodeProps {
  onApplyDiscount: (discountPercent: number) => void;
}

const DiscountCode = ({ onApplyDiscount }: DiscountCodeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [isApplied, setIsApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validDiscountCode = "SAVE10";
  const discountPercent = 10;

  const handleApply = () => {
    if (code.trim().toUpperCase() === validDiscountCode) {
      setIsApplied(true);
      setError(null);
      onApplyDiscount(discountPercent);
    } else {
      setError("Invalid discount code. Try SAVE10 for 10% off.");
    }
  };

  const handleRemove = () => {
    setIsApplied(false);
    setCode("");
    onApplyDiscount(0);
  };

  const handleAutoFill = () => {
    setCode(validDiscountCode);
    setIsApplied(true);
    setError(null);
    onApplyDiscount(discountPercent);
  };

  if (isApplied) {
    return (
      <div className="bg-green-50 p-3 rounded-md border border-green-200 flex items-center justify-between">
        <div className="flex items-center">
          <Check className="text-green-600 h-5 w-5 mr-2" />
          <div>
            <p className="text-sm font-medium text-green-900">
              Discount code <span className="font-mono">{code.toUpperCase()}</span> applied
            </p>
            <p className="text-xs text-green-700">You saved {discountPercent}% on your order</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRemove} className="text-red-600 hover:text-red-700 hover:bg-red-50">
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div>
      {isOpen ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter discount code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleApply}>
              Apply
            </Button>
          </div>
          {error && (
            <div className="text-sm text-red-600 flex items-start gap-1">
              <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <Button 
            variant="link" 
            className="p-0 h-auto text-blue-600" 
            onClick={handleAutoFill}
          >
            Use code SAVE10 for 10% off
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline" 
          className="w-full justify-start text-gray-600" 
          onClick={() => setIsOpen(true)}
        >
          <Tag className="h-4 w-4 mr-2" />
          Add discount code
        </Button>
      )}
    </div>
  );
};

export default DiscountCode;
