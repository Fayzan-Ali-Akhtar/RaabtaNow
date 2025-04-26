
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/ui/feature-card';
import MainLayout from '@/components/layout/MainLayout';
import { FileText, MessageSquare, Search, Settings } from 'lucide-react';

const HomePage = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight hero-text-gradient">
              Accelerate Your Career With AI-Powered Job Tools
            </h1>
            <p className="mt-6 text-xl text-gray-600">
              WorkLink AI helps job seekers create professional profiles, generate tailored cover letters, 
              and discover perfectly matched job opportunities.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/signup">
                <Button size="lg" className="text-base">Get Started</Button>
              </Link>
              <Link to="/features">
                <Button variant="outline" size="lg" className="text-base">Explore Features</Button>
              </Link>
            </div>
          </div>
          <div className="lg:flex justify-end hidden">
            <img 
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&w=1200&h=800" 
              alt="Person using WorkLink AI platform" 
              className="rounded-lg shadow-lg object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 -mx-4 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Powerful Features for Job Seekers</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Tools designed to streamline your job search and help you stand out to employers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<FileText size={24} />}
            title="AI Cover Letters"
            description="Generate personalized cover letters tailored to your experience and specific job descriptions."
          />
          <FeatureCard 
            icon={<MessageSquare size={24} />}
            title="Professional Network"
            description="Connect with other professionals, share insights, and grow your network."
          />
          <FeatureCard 
            icon={<Search size={24} />}
            title="Smart Job Matching"
            description="Get job recommendations that match your skills, experience, and preferences."
          />
          <FeatureCard 
            icon={<Settings size={24} />}
            title="Resume Builder"
            description="Create and manage professional resumes with customizable templates."
          />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Success Stories</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            See how WorkLink AI has helped job seekers land their dream roles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-worklink-100 flex items-center justify-center text-worklink-700 font-semibold border border-worklink-200">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-worklink-50 -mx-4 px-4 rounded-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ready to Transform Your Job Search?</h2>
          <p className="mt-4 text-xl text-gray-700 max-w-2xl mx-auto">
            Join thousands of professionals who are accelerating their careers with WorkLink AI.
          </p>
          <div className="mt-8">
            <Link to="/signup">
              <Button size="lg" className="text-base">Create Your Free Account</Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

// Sample testimonial data
const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Manager",
    quote: "The AI cover letter generator saved me hours of time and helped me land interviews at top companies."
  },
  {
    name: "Michael Chen",
    role: "Software Developer",
    quote: "WorkLink's job matching algorithm found me opportunities I wouldn't have discovered on traditional job boards."
  },
  {
    name: "Priya Patel",
    role: "UX Designer",
    quote: "I built a professional network and got valuable feedback on my portfolio through the WorkLink community."
  }
];

export default HomePage;
