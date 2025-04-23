
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  matchScore?: number;
  tags?: string[];
  logoUrl?: string;
  applyUrl?: string;
}

export function JobCard({
  id,
  title,
  company,
  location,
  description,
  matchScore,
  tags = [],
  logoUrl,
  applyUrl = '#',
}: JobCardProps) {
  return (
    <Card className="mb-4 card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 flex-shrink-0 bg-white rounded-md shadow-sm border flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={company} className="w-full h-full object-contain" />
              ) : (
                <div className="text-xl font-bold text-worklink-700">{company.charAt(0)}</div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
              <div className="flex items-center text-sm text-gray-600 space-x-2">
                <span>{company}</span>
                <span>•</span>
                <span>{location}</span>
              </div>
            </div>
          </div>
          
          {matchScore !== undefined && (
            <Badge variant="outline" className="bg-worklink-50 text-worklink-700 border-worklink-200">
              {matchScore}% Match
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="py-2">
        <p className="text-gray-700 line-clamp-3 mb-3">{description}</p>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-4 flex justify-between border-t">
        <Button asChild variant="outline">
          <a href={`/jobs/${id}`}>View Details</a>
        </Button>
        <Button asChild>
          <a href={applyUrl} target="_blank" rel="noopener noreferrer">Apply Now</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
