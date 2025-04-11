
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Star } from "lucide-react";

interface GradeAppDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const GradeAppDialog = ({ open, setOpen }: GradeAppDialogProps) => {
  const navigate = useNavigate();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-xl">Rate Your Experience</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            <div className="flex justify-center my-6">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    className="h-8 w-8 text-amber-400 cursor-pointer hover:scale-110 transition-transform"
                    fill="currentColor"
                    onClick={() => {
                      // In a real app, you would send this rating to your backend
                      console.log(`User rated: ${rating}`);
                      setOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>
            <p className="mb-4">
              You've used all your daily searches. How was your experience with our app?
            </p>
            <p className="text-sm text-gray-500">
              Rate us to help us improve, and consider upgrading for unlimited searches.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-2">
          <AlertDialogCancel
            className="w-full sm:w-auto"
            onClick={() => setOpen(false)}
          >
            Maybe Later
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
            onClick={() => {
              navigate("/pricing");
              setOpen(false);
            }}
          >
            Upgrade Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GradeAppDialog;
