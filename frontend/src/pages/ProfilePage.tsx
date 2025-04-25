import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Download, Trash } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { PostCard } from '@/components/ui/post-card';
import axios from 'axios';

const ProfilePage = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const userPosts = [
    {
      id: '1',
      author: { id: 'current-user', name: 'Alex Johnson' },
      content: 'Completed a certification in AWS! #CloudComputing',
      likes: 15,
      comments: 3,
      timestamp: '1 week ago'
    },
    {
      id: '2',
      author: { id: 'current-user', name: 'Alex Johnson' },
      content: 'Exploring React Server Components!',
      likes: 7,
      comments: 5,
      timestamp: '2 weeks ago'
    }
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/getprofile');
        setProfileData(res.data.profile);
      } catch (error) {
        console.error('Failed to fetch profile', error);
        toast({
          title: "Error",
          description: "Could not load your profile.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      await axios.patch('/api/updateprofile', profileData);
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully."
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile', error);
      toast({
        title: "Error",
        description: "Could not update your profile.",
        variant: "destructive"
      });
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      toast({
        title: "Resume uploaded",
        description: `${file.name} has been successfully uploaded.`
      });
    }
  };

  const handleDeleteResume = () => {
    setResumeFile(null);
    toast({
      title: "Resume deleted",
      description: "Your resume has been removed."
    });
  };

  const handleGenerateCoverLetter = () => {
    toast({
      title: "Redirecting",
      description: "Taking you to the cover letter generator."
    });
    // navigate('/cover-letter');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <p className="text-gray-500">Loading your profile...</p>
        </div>
      </MainLayout>
    );
  }

  if (!profileData) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <p className="text-red-500">No profile found.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Profile Header */}
          <div className="bg-worklink-50 p-6 sm:p-8 border-b">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-worklink-100 flex items-center justify-center text-worklink-700 text-3xl font-semibold border border-worklink-200">
                {profileData.full_name?.charAt(0)}
              </div>

              <div className="flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{profileData.full_name}</h1>
                    <p className="text-gray-600">{profileData.professional_headline}</p>
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
                  {/* Editable form */}
                  {[
                    ['Full Name', 'full_name'],
                    ['Email', 'contact_email'],
                    ['Company', 'company'],
                    ['Location', 'location'],
                    ['Professional Headline', 'professional_headline'],
                    ['Age', 'age'],
                    ['Years of Experience', 'working_experience']
                  ].map(([label, key]) => (
                    <div key={key} className="space-y-2">
                      <Label>{label}</Label>
                      <Input
                        value={profileData[key]}
                        onChange={(e) => setProfileData({ ...profileData, [key]: e.target.value })}
                        type={key === 'age' || key === 'working_experience' ? 'number' : 'text'}
                      />
                    </div>
                  ))}

                  <div className="space-y-2">
                    <Label>Skills (comma separated)</Label>
                    <Input
                      value={profileData.skills.join(', ')}
                      onChange={(e) => setProfileData({ ...profileData, skills: e.target.value.split(',').map((s) => s.trim()) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Static view */}
                  {[
                    ['Bio', profileData.bio],
                    ['Email', profileData.contact_email],
                    ['Location', profileData.location],
                    ['Company', profileData.company],
                    ['Skills', profileData.skills?.join(', ')],
                    ['Professional Headline', profileData.professional_headline]
                  ].map(([title, value]) => (
                    <div key={title}>
                      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                      <p className="mt-1 text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Resume, Posts, CoverLetter tabs */}
            <TabsContent value="posts">
              <div className="space-y-4">
                {userPosts.map((post) => (
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
            </TabsContent>

            <TabsContent value="resume">
              <div className="text-center">
                {!resumeFile ? (
                  <div>
                    <Upload className="mx-auto h-16 w-16 text-gray-400" />
                    <p className="mt-4">No Resume uploaded</p>
                    <label htmlFor="resume-upload">
                      <Button as="span" className="mt-2">
                        Upload Resume
                        <input id="resume-upload" type="file" accept=".pdf,.docx" className="sr-only" onChange={handleResumeUpload} />
                      </Button>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p>Uploaded: {resumeFile.name}</p>
                    <Button variant="outline" onClick={handleDeleteResume}>
                      <Trash className="mr-2 h-4 w-4" /> Delete Resume
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="coverLetter">
              <div className="flex flex-col items-center space-y-4">
                <FileText className="h-10 w-10 text-gray-400" />
                <Button onClick={handleGenerateCoverLetter}>Generate Cover Letter</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
