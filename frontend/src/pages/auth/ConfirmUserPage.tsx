import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { VITE_BACKEND_URL } from '../../constant'; // Make sure you have a VITE_BACKEND_URL like "http://localhost:5000/api" etc.
import axios from 'axios';


const ConfirmUserPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { email } = location.state || {};

  const { toast } = useToast();
  const {  isLoading: authLoading } = useAuth(); 
  const [formData, setFormData] = useState({
    Code: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log("hello", email, formData.Code);
      
      // console.log('User logged in:', user); // user object, check if login was successful
      // 1. Signup API
      await axios.post(`${VITE_BACKEND_URL}/api/confirm`, {
        email: email,
        confirmationCode: formData.Code,
      });



      toast({
        title: "Email Confirmed",
        description: "Your email has been confirmed successfully. You can now log in.",
      });
      
      navigate('/login');
      
      
    } catch (error) {
      console.error(' error:', error);
      toast({
        title: "Confirmation failed",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-center items-center py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Confirm Account</h1>
            <p className="text-gray-600 mt-2">Enter Confirmation Code You Recieved In Email</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">  
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Enter 6 digit code</Label>
                  </div>
                  <Input 
                    id="Code"
                    name="Code"
                    type="text"
                    placeholder="eg. 123456"
                    value={formData.Code}
                    onChange={handleChange}
                    required
                  />
                </div>
              
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={authLoading} // Use authLoading from context
                >
                  {authLoading ? "Confirming..." : "Confirm"}
                </Button>
              </div>
            </form>
            
    
          </div>
          
        </div>
      </div>
    </MainLayout>
  );
};

export default ConfirmUserPage;