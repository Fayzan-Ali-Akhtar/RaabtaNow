import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { VITE_BACKEND_URL } from "@/constant";
import axios from "axios";
import { FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";

interface UserProfile {
  full_name: string;
  working_experience: string;
  bio: string;
  location: string;
  company: string;
  skills: string[];
  professional_headline: string;
}

const CoverLetterPage = () => {
  const { getAuthToken } = useAuth();
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [coverLetterContent, setCoverLetterContent] = useState("");
  const [profileComplete, setProfileComplete] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const titleParam = searchParams.get("title");
    const companyParam = searchParams.get("company");

    if (titleParam && companyParam) {
      setJobTitle(titleParam);
      setCompanyName(companyParam);
      setIsReadOnly(true);
    }

    const fetchProfile = async () => {
      try {
        const token = getAuthToken();
        const res = await axios.get(`${VITE_BACKEND_URL}/api/getprofile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        console.log("Fetched profile:", data);

        console.log(data.profile.skills);
        console.log(data.profile.bio);
        console.log(data.profile.location);
        console.log(data.profile.contact_email);
        console.log(data.profile.company);
        console.log(data.profile.professional_headline);
        console.log(data.profile.User?.email);
        console.log(data.profile.skills.length > 0);

        const hasRequiredFields =
          data.profile.full_name &&
          data.profile.working_experience &&
          data.profile.bio &&
          data.profile.location &&
          (data.profile.contact_email || data.profile.User?.email) &&
          data.profile.company &&
          data.profile.skills &&
          data.profile.skills.length > 0 &&
          data.profile.professional_headline;
        console.log("Profile completeness check:", Boolean(hasRequiredFields));

        setProfileComplete(Boolean(hasRequiredFields));

        const user = {
          full_name: data.profile.full_name,
          working_experience: data.profile.working_experience,
          bio: data.profile.bio,
          location: data.profile.location,
          company: data.profile.company,
          skills: data.profile.skills,
          professional_headline: data.profile.professional_headline,
        };

        setUserProfile(user);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Profile fetch failed",
          description: "Unable to retrieve user profile data.",
          variant: "destructive",
        });
      }
    };

    fetchProfile();
  }, [searchParams]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobTitle || !companyName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!profileComplete || !userProfile) {
      toast({
        title: "Incomplete Profile",
        description:
          "Please complete your profile (bio, email, location, company, skills, headline) to use the generator.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const payload = {
        job_title: jobTitle,
        company_name: companyName,
        user_profile: {
          name: userProfile.full_name || "Your Name",
          experience: userProfile.working_experience || "3",
          skills: userProfile.skills || [],
          achievements: "",
          tone: "professional",
          highlight: userProfile.professional_headline || "",
        },
        query:
          "Generate a cover letter tailored to the job description and company.",
      };

      const res = await axios.post(
        "https://hv9xpbj5sj.execute-api.us-east-1.amazonaws.com/query",
        payload
      );

      console.log("Generated cover letter:", res.data);

      setCoverLetterContent(res.data?.text || "Generated content goes here...");
      toast({
        title: "Cover letter generated",
        description:
          "Your personalized cover letter has been created successfully.",
      });
    } catch (err) {
      console.error("Error generating cover letter:", err);
      toast({
        title: "Generation failed",
        description: "Something went wrong while generating the cover letter.",
        variant: "destructive",
      });
    }

    setIsGenerating(false);
  };

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Cover letter saved",
      description: "Your cover letter has been saved successfully.",
    });
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(coverLetterContent)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Cover letter copied to clipboard.",
        });
      })
      .catch(() => {
        toast({
          title: "Copy failed",
          description: "Could not copy cover letter to clipboard.",
          variant: "destructive",
        });
      });
  };

  const handleDownload = () => {
    const blob = new Blob([coverLetterContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cover_letter.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloading cover letter",
      description: "Your cover letter is being downloaded.",
    });
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">AI Cover Letter Generator</h1>

        {!profileComplete && (
          <div className="bg-yellow-100 text-yellow-900 border border-yellow-300 p-4 rounded mb-6">
            Your profile is incomplete. Please update your profile with your
            bio, email, location, company, skills, and professional headline to
            generate a cover letter.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Job Details Form */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Job Details</h2>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input
                    id="job-title"
                    placeholder="e.g., Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    required
                    readOnly={isReadOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <select
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={isReadOnly}
                    required
                    className="w-full border px-3 py-2 rounded text-sm text-gray-900"
                  >
                    <option value="">Select Company</option>
                    <option value="Google (Alphabet Inc.)">
                      Google (Alphabet Inc.)
                    </option>
                    <option value="Microsoft">Microsoft</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Apple">Apple</option>
                    <option value="Meta (formerly Facebook)">
                      Meta (formerly Facebook)
                    </option>
                    <option value="Netflix">Netflix</option>
                    <option value="NVIDIA">NVIDIA</option>
                    <option value="Tesla">Tesla</option>
                    <option value="Adobe">Adobe</option>
                    <option value="Salesforce">Salesforce</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isGenerating || !profileComplete}
                >
                  {isGenerating ? "Generating..." : "Generate Cover Letter"}
                </Button>
              </form>
            </div>
          </div>

          {/* Preview Section */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
              <div className="p-6 border-b flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-worklink-600" />
                  <h2 className="text-lg font-semibold">Cover Letter</h2>
                </div>
                {coverLetterContent && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      Copy
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-6 flex-grow">
                {coverLetterContent ? (
                  isEditing ? (
                    <div className="h-full flex flex-col">
                      <Textarea
                        className="flex-grow resize-none font-mono"
                        value={coverLetterContent}
                        onChange={(e) => setCoverLetterContent(e.target.value)}
                        rows={20}
                      />
                      <div className="mt-4 flex justify-end">
                        <Button onClick={handleSave}>Save Changes</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded border min-h-[500px] whitespace-pre-line">
                      {coverLetterContent}
                    </div>
                  )
                ) : (
                  <div className="text-center py-16">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No cover letter generated yet
                    </h3>
                    <p className="text-gray-600 mb-4 max-w-md mx-auto">
                      Fill out the job details and click "Generate Cover
                      Letter".
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CoverLetterPage;
