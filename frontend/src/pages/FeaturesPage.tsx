
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/ui/feature-card';
import MainLayout from '@/components/layout/MainLayout';
import { FileText, MessageSquare, Search, User, Settings, Bell } from 'lucide-react';

const FeaturesPage = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Powerful Features for Your Job Search</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover how WorkLink AI helps job seekers stand out, connect, and land their dream jobs.
          </p>
          <Link to="/signup">
            <Button size="lg">Get Started for Free</Button>
          </Link>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<FileText size={24} />}
            title="AI Cover Letter Generator"
            description="Our AI analyzes your resume and the job description to create personalized, compelling cover letters in seconds."
          />
          <FeatureCard 
            icon={<User size={24} />}
            title="Professional Profile"
            description="Create a comprehensive profile showcasing your skills, experience, and portfolio to stand out to employers."
          />
          <FeatureCard 
            icon={<Search size={24} />}
            title="Smart Job Matching"
            description="Our AI matches your skills and preferences with job opportunities for higher relevance and success rates."
          />
        </div>
      </section>

      {/* Feature Details */}
      <section className="py-16">
        <div className="space-y-24">
          {/* AI Cover Letter Feature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">AI-Powered Cover Letters</h2>
              <p className="text-lg text-gray-600 mb-6">
                Say goodbye to generic templates. Our AI technology creates personalized cover letters that highlight your relevant skills and experience for each specific job application.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-worklink-600">✓</div>
                  <span>Analyzes your resume to identify key strengths</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-worklink-600">✓</div>
                  <span>Tailors content to match job descriptions</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-worklink-600">✓</div>
                  <span>Fully editable with downloadable formats</span>
                </li>
              </ul>
              <Link to="/signup">
                <Button>Try It Now</Button>
              </Link>
            </div>
            <div className="bg-worklink-50 p-8 rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&w=800&h=500" 
                alt="AI Cover Letter Generator" 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Job Recommendations Feature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-worklink-50 p-8 rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&w=800&h=500" 
                alt="Job Recommendations" 
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-4">Intelligent Job Matching</h2>
              <p className="text-lg text-gray-600 mb-6">
                Our matching algorithm finds jobs that align with your skills, experience, and preferences, saving you time and increasing your chances of success.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-worklink-600">✓</div>
                  <span>Personalized job recommendations</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-worklink-600">✓</div>
                  <span>Displays match percentage for each job</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-worklink-600">✓</div>
                  <span>Filter by location, job type, and experience level</span>
                </li>
              </ul>
              <Link to="/signup">
                <Button>Find Your Match</Button>
              </Link>
            </div>
          </div>

          {/* Professional Network Feature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Professional Networking</h2>
              <p className="text-lg text-gray-600 mb-6">
                Connect with other professionals, share insights, and grow your network. Engage in meaningful discussions and discover new opportunities.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-worklink-600">✓</div>
                  <span>Create and engage with posts</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-worklink-600">✓</div>
                  <span>Connect with industry professionals</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-worklink-600">✓</div>
                  <span>Share job search tips and experiences</span>
                </li>
              </ul>
              <Link to="/signup">
                <Button>Join the Community</Button>
              </Link>
            </div>
            <div className="bg-worklink-50 p-8 rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&w=800&h=500" 
                alt="Professional Network" 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-12 bg-gray-50 -mx-4 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">More Powerful Features</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to accelerate your job search and career growth.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<Bell size={24} />}
            title="Job Alerts"
            description="Get notified about new job opportunities that match your profile and preferences."
          />
          <FeatureCard 
            icon={<MessageSquare size={24} />}
            title="Networking Forum"
            description="Connect with professionals in your industry to exchange advice and opportunities."
          />
          <FeatureCard 
            icon={<Settings size={24} />}
            title="Resume Management"
            description="Upload, store, and manage multiple versions of your resume for different job applications."
          />
          <FeatureCard 
            icon={<User size={24} />}
            title="Career Insights"
            description="Access valuable data and trends to inform your job search strategy."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Job Search?</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Join thousands of professionals who are using WorkLink AI to find their dream jobs faster.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/signup">
            <Button size="lg">Create Free Account</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">Sign In</Button>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
};

export default FeaturesPage;
