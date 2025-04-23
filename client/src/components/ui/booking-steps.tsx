import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface BookingStepsProps {
  currentStep: 1 | 2 | 3;
  className?: string;
}

export default function BookingSteps({ currentStep, className }: BookingStepsProps) {
  return (
    <div className={cn("px-6 pt-6", className)}>
      <div className="flex items-center">
        {/* Step 1 */}
        <div 
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full text-black font-bold text-sm",
            currentStep > 1 ? "bg-success" : currentStep === 1 ? "bg-accent" : "bg-gray-700 text-white"
          )}
        >
          {currentStep > 1 ? <Check className="h-5 w-5" /> : 1}
        </div>
        
        {/* Line between step 1 and 2 */}
        <div 
          className={cn(
            "flex-1 h-1 mx-2",
            currentStep > 1 ? "bg-accent" : "bg-gray-700"
          )}
        ></div>
        
        {/* Step 2 */}
        <div 
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full text-sm",
            currentStep > 2 ? "bg-success text-black font-bold" : 
            currentStep === 2 ? "bg-accent text-black font-bold" : 
            "bg-gray-700 text-white font-bold"
          )}
        >
          {currentStep > 2 ? <Check className="h-5 w-5" /> : 2}
        </div>
        
        {/* Line between step 2 and 3 */}
        <div 
          className={cn(
            "flex-1 h-1 mx-2",
            currentStep > 2 ? "bg-accent" : "bg-gray-700"
          )}
        ></div>
        
        {/* Step 3 */}
        <div 
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
            currentStep === 3 ? "bg-accent text-black" : "bg-gray-700 text-white"
          )}
        >
          3
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
        <div>Showtime</div>
        <div>Seats</div>
        <div>Payment</div>
      </div>
    </div>
  );
}
