import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { FileText, Download, Settings } from "lucide-react";

const CoverLetterPage = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [selectedResume, setSelectedResume] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [coverLetterContent, setCoverLetterContent] = useState("");

  const resumeOptions = [
    { id: "resume-1", name: "Software_Developer_Resume.pdf" },
    { id: "resume-2", name: "Marketing_Resume.pdf" },
  ];

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const titleParam = searchParams.get("title");
    const companyParam = searchParams.get("company");

    if (titleParam && companyParam) {
      setJobTitle(titleParam);
      setCompanyName(companyParam);
      setIsReadOnly(true);
    }
  }, [searchParams]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobTitle || !companyName || !selectedResume) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const generatedContent = `
Dear Hiring Manager,

I am writing to express my interest in the ${jobTitle} position at ${companyName}. As a passionate professional with experience in developing innovative solutions, I believe I would be a valuable addition to your team.

Throughout my career, I have developed strong technical skills in frontend and backend development, with particular expertise in React, TypeScript, and Node.js. My experience aligns perfectly with the requirements outlined in your job posting.

At my previous role, I led the development of a customer portal that increased user engagement by 45% and reduced support tickets by 30%. I collaborated effectively with cross-functional teams to deliver this project ahead of schedule and under budget.

I am particularly drawn to ${companyName}'s commitment to innovation and user-centered design. Your recent project launching an AI-powered recommendation engine resonates with my own professional interests and expertise.

I would welcome the opportunity to discuss how my skills and experience can contribute to your team's success. Thank you for considering my application.

Sincerely,
Alex Johnson
      `;

      setCoverLetterContent(generatedContent);
      setIsGenerating(false);

      toast({
        title: "Cover letter generated",
        description:
          "Your personalized cover letter has been created successfully.",
      });
    }, 2500);
  };

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Cover letter saved",
      description: "Your cover letter has been saved successfully.",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Downloading cover letter",
      description: "Your cover letter is being prepared for download.",
    });

    setTimeout(() => {
      console.log("Download logic here");
    }, 1000);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">AI Cover Letter Generator</h1>

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
                  {isReadOnly ? (
                    <Input
                      id="company-name"
                      value={companyName}
                      readOnly
                      className="w-full"
                    />
                  ) : (
                    <select
                      id="company-name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full p-2 mb-2 border rounded"
                      required
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
                  )}
                </div>
                <div>
                  <Label htmlFor="resume-select">Select Resume</Label>
                  <Select
                    value={selectedResume}
                    onValueChange={setSelectedResume}
                  >
                    <SelectTrigger id="resume-select">
                      <SelectValue placeholder="Choose a resume" />
                    </SelectTrigger>
                    <SelectContent>
                      {resumeOptions.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id}>
                          {resume.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Our AI will analyze your resume to personalize the cover
                    letter.
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate Cover Letter"}
                </Button>
              </form>
            </div>
          </div>

          {/* Preview / Edit Section */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
              <div className="p-6 border-b flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-worklink-600" />
                  <h2 className="text-lg font-semibold">Cover Letter</h2>
                </div>

                <div className="flex space-x-2">
                  {coverLetterContent && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        {isEditing ? "Preview" : "Edit"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </>
                  )}
                </div>
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
                      Fill out the job details on the left and click "Generate
                      Cover Letter" to create your personalized cover letter.
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
