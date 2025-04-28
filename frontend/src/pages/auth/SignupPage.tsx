import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import MainLayout from '@/components/layout/MainLayout';
import { VITE_BACKEND_URL } from '../../constant'; // Make sure you have a VITE_BACKEND_URL like "http://localhost:5000/api" etc.

const SignupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth(); // ✅ useAuth for auto-login after signup
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    agreeTerms: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      agreeTerms: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeTerms) {
      toast({
        title: "Terms and Conditions",
        description: "You must agree to the terms and conditions to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Signup API
      await axios.post(`${VITE_BACKEND_URL}/api/register`, {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      // 2. Auto login after signup
      // await login(formData.email, formData.password);

      toast({
        title: "Account created successfully Please Confirm Email to Login",
        description: "Welcome to WorkLink AI!"
      });

      // 3. Redirect to Feed
      navigate('/login');

    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: error?.response?.data?.message || error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-center items-center py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Create your account</h1>
            <p className="text-gray-600 mt-2">Start your journey with WorkLink AI</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="agreeTerms" 
                    checked={formData.agreeTerms}
                    onCheckedChange={handleCheckboxChange}
                    className="mt-1"
                  />
                  <Label htmlFor="agreeTerms" className="text-sm">
                    I agree to the{' '}
                    <Link to="/terms" className="text-worklink-600 hover:text-worklink-700">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-worklink-600 hover:text-worklink-700">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full" type="button">
                  Google
                </Button>
                <Button variant="outline" className="w-full" type="button">
                  GitHub
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-worklink-600 hover:text-worklink-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SignupPage;
