
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JobCard } from '@/components/ui/job-card';
import MainLayout from '@/components/layout/MainLayout';
import { Search } from 'lucide-react';

// Sample job data (in a real app, this would come from an API)
const initialJobs = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA (Remote)',
    description: 'We are seeking an experienced React developer to join our frontend team. You will be responsible for building responsive user interfaces and implementing complex features.',
    matchScore: 92,
    tags: ['React', 'TypeScript', 'Redux', 'Senior'],
    logoUrl: '',
    applyUrl: '#'
  },
  {
    id: '2',
    title: 'UX/UI Designer',
    company: 'DesignHub',
    location: 'New York, NY',
    description: 'Join our creative team to design intuitive and beautiful user experiences for web and mobile applications. Must have a strong portfolio and experience with Figma.',
    matchScore: 85,
    tags: ['UI Design', 'Figma', 'User Research', 'Prototyping'],
    logoUrl: '',
    applyUrl: '#'
  },
  {
    id: '3',
    title: 'Full Stack Engineer',
    company: 'StartupInc',
    location: 'Austin, TX (Hybrid)',
    description: 'Looking for a versatile developer comfortable with both frontend and backend technologies. Stack includes React, Node.js, and MongoDB.',
    matchScore: 78,
    tags: ['Full Stack', 'JavaScript', 'Node.js', 'MongoDB'],
    logoUrl: '',
    applyUrl: '#'
  },
  {
    id: '4',
    title: 'Product Manager',
    company: 'ProductPro',
    location: 'Seattle, WA',
    description: 'Lead the development of new product features from conception to launch. Work closely with design, engineering, and marketing teams.',
    matchScore: 73,
    tags: ['Product Management', 'Agile', 'Roadmapping'],
    logoUrl: '',
    applyUrl: '#'
  }
];

const JobsPage = () => {
  const [jobs, setJobs] = useState(initialJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    experience: ''
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API with the search parameters
    console.log('Search query:', searchQuery);
    console.log('Filters:', filters);
    
    // Mock filtered results (in a real app, this would be handled by the API)
    let filteredJobs = [...initialJobs];
    
    if (searchQuery) {
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filters.location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.jobType) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(filters.jobType.toLowerCase())
      );
    }
    
    setJobs(filteredJobs);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilters({
      location: '',
      jobType: '',
      experience: ''
    });
    setJobs(initialJobs);
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Recommended Jobs</h1>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search jobs, companies, or keywords"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="location-filter">Location</Label>
                <Select 
                  value={filters.location}
                  onValueChange={(value) => setFilters({...filters, location: value})}
                >
                  <SelectTrigger id="location-filter">
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="san francisco">San Francisco</SelectItem>
                    <SelectItem value="new york">New York</SelectItem>
                    <SelectItem value="austin">Austin</SelectItem>
                    <SelectItem value="seattle">Seattle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="job-type-filter">Job Type</Label>
                <Select 
                  value={filters.jobType}
                  onValueChange={(value) => setFilters({...filters, jobType: value})}
                >
                  <SelectTrigger id="job-type-filter">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="on-site">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="experience-filter">Experience</Label>
                <Select 
                  value={filters.experience}
                  onValueChange={(value) => setFilters({...filters, experience: value})}
                >
                  <SelectTrigger id="experience-filter">
                    <SelectValue placeholder="Any experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any experience</SelectItem>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end space-x-2">
                <Button type="submit">Search</Button>
                <Button type="button" variant="outline" onClick={handleResetFilters}>Reset</Button>
              </div>
            </div>
          </form>
        </div>
        
        {/* Job Listings */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Jobs Matching Your Profile</h2>
            <span className="text-gray-500">{jobs.length} jobs found</span>
          </div>
          
          {jobs.length > 0 ? (
            <div>
              {jobs.map(job => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  description={job.description}
                  matchScore={job.matchScore}
                  tags={job.tags}
                  logoUrl={job.logoUrl}
                  applyUrl={job.applyUrl}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matching jobs found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters.</p>
              <Button onClick={handleResetFilters}>Reset Filters</Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default JobsPage;
