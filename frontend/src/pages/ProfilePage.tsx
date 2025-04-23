
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Download, Trash } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { PostCard } from '@/components/ui/post-card';

const ProfilePage = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  // Mock data - in a real app, this would come from an API
  const [profileData, setProfileData] = useState({
    name: 'Alex Johnson',
    headline: 'Full Stack Developer | React Specialist',
    bio: 'Passionate developer with 5+ years of experience building web applications. Specialized in React, Node.js, and cloud technologies.',
    email: 'alex.johnson@example.com',
    location: 'San Francisco, CA'
  });
  
  // Sample user posts
  const userPosts = [
    {
      id: '1',
      author: { id: 'current-user', name: 'Alex Johnson' },
      content: 'Just completed a certification in AWS! Looking forward to building more cloud-native applications. #AWS #CloudComputing',
      likes: 15,
      comments: 3,
      timestamp: '1 week ago'
    },
    {
      id: '2',
      author: { id: 'current-user', name: 'Alex Johnson' },
      content: 'Has anyone used the AI cover letter feature for a developer position? Would love to hear your experiences!',
      likes: 7,
      comments: 12,
      timestamp: '2 weeks ago'
    }
  ];

  const handleSaveProfile = () => {
    // In a real app, this would call an API to update the profile
    setIsEditing(false);
    
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully."
    });
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would upload the file to a server
      setResumeFile(file);
      
      toast({
        title: "Resume uploaded",
        description: `${file.name} has been successfully uploaded.`
      });
    }
  };

  const handleDeleteResume = () => {
    // In a real app, this would call an API to delete the resume
    setResumeFile(null);
    
    toast({
      title: "Resume deleted",
      description: "Your resume has been removed."
    });
  };

  const handleGenerateCoverLetter = () => {
    // In a real app, this would navigate to the cover letter generator page
    toast({
      title: "Redirecting",
      description: "Taking you to the cover letter generator."
    });
    // navigate('/cover-letter');
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Profile Header */}
          <div className="bg-worklink-50 p-6 sm:p-8 border-b">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-worklink-100 flex items-center justify-center text-worklink-700 text-3xl font-semibold border border-worklink-200">
                {profileData.name.charAt(0)}
              </div>
              
              <div className="flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                    <p className="text-gray-600">{profileData.headline}</p>
                  </div>
                  
                  <Button 
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  >
                    {isEditing ? "Save Profile" : "Edit Profile"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Tabs */}
          <Tabs defaultValue="about" className="p-6">
            <TabsList className="mb-6">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="posts">My Posts</TabsTrigger>
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="coverLetter">Cover Letter</TabsTrigger>
            </TabsList>
            
            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="headline">Professional Headline</Label>
                    <Input 
                      id="headline"
                      value={profileData.headline}
                      onChange={(e) => setProfileData({...profileData, headline: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio"
                      rows={4}
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">About Me</h3>
                    <p className="mt-2 text-gray-700">{profileData.bio}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1 text-gray-900">{profileData.email}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Location</h3>
                      <p className="mt-1 text-gray-900">{profileData.location}</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            {/* Posts Tab */}
            <TabsContent value="posts">
              {userPosts.length > 0 ? (
                <div className="space-y-6">
                  {userPosts.map(post => (
                    <PostCard
                      key={post.id}
                      id={post.id}
                      author={post.author}
                      content={post.content}
                      likes={post.likes}
                      comments={post.comments}
                      timestamp={post.timestamp}
                      isOwnPost={true}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">You haven't created any posts yet.</p>
                  <Button className="mt-4" asChild>
                    <a href="/feed">Create Your First Post</a>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Resume Tab */}
            <TabsContent value="resume">
              <div className="bg-gray-50 border rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-worklink-600" />
                    <h3 className="text-lg font-medium">Resume</h3>
                  </div>
                </div>
                
                {resumeFile ? (
                  <div className="space-y-6">
                    <div className="bg-white border rounded p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{resumeFile.name}</p>
                        <p className="text-sm text-gray-500">
                          Uploaded on {new Date().toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDeleteResume}>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Upload your resume</h3>
                    <p className="text-gray-500 mb-4">PDF or DOCX file, max 5MB</p>
                    <div>
                      <label htmlFor="resume-upload">
                        <Button as="span">
                          Choose File
                          <input
                            id="resume-upload"
                            type="file"
                            accept=".pdf,.docx"
                            className="sr-only"
                            onChange={handleResumeUpload}
                          />
                        </Button>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Cover Letter Tab */}
            <TabsContent value="coverLetter">
              <div className="bg-gray-50 border rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-worklink-600" />
                    <h3 className="text-lg font-medium">Cover Letter Generator</h3>
                  </div>
                </div>
                
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">Generate custom cover letters</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Our AI-powered tool creates personalized cover letters based on your resume and job description.
                  </p>
                  <Button onClick={handleGenerateCoverLetter}>
                    Generate Cover Letter
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
