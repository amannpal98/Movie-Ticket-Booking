import { Button } from '@/components/ui/button';

interface OfferCardProps {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  gradientFrom: string;
  gradientTo: string;
  onClick: () => void;
}

export default function OfferCard({
  title,
  subtitle,
  description,
  imageUrl,
  buttonText,
  gradientFrom,
  gradientTo,
  onClick
}: OfferCardProps) {
  return (
    <div 
      className={`bg-gradient-to-r from-${gradientFrom} to-${gradientTo} rounded-lg overflow-hidden shadow-lg p-6`}
    >
      <div className="flex flex-col md:flex-row items-center">
        <div className="md:w-2/3 mb-4 md:mb-0 md:mr-4">
          <div className="text-accent font-semibold text-sm mb-2">{subtitle}</div>
          <h3 className="text-white text-xl md:text-2xl font-bold mb-2">{title}</h3>
          <p className="text-gray-300 text-sm mb-4">{description}</p>
          <Button
            className="bg-accent hover:bg-amber-600 text-black font-medium transition-colors"
            onClick={onClick}
          >
            {buttonText}
          </Button>
        </div>
        <div className="md:w-1/3 flex justify-center">
          <img 
            src={imageUrl} 
            alt={title} 
            className="h-32 w-32 object-cover rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
