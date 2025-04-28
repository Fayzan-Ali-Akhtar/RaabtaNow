import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobCard } from "@/components/ui/job-card";
import MainLayout from "@/components/layout/MainLayout";
import { Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { VITE_BACKEND_URL } from "@/constant";

const JobsPage = () => {
  const currentUserId = 1; // Replace this with user session later
  const { toast } = useToast();

  const { user } = useAuth(); 
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    jobType: "",
    experience: "",
  });
  const { getAuthToken } = useAuth();
  const [editingJobId, setEditingJobId] = useState(null);
  const [editingFields, setEditingFields] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    work_type: "",
    experience_level: "",
  });
  const [jobCompany, setJobCompany] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${VITE_BACKEND_URL}/api/getalljobposts`,{
          headers: {
            Authorization: `Bearer ${getAuthToken()}`
          }
        });
        setJobs(res.data.jobPosts || []);
        setFilteredJobs(res.data.jobPosts || []);
      } catch (err) {
        console.error("Failed to fetch job posts:", err);
      }
    };
    fetchJobs();
  }, []);

  const handleSearch = (e:any) => {
    e.preventDefault();
    let results = [...jobs];

    if (searchQuery) {
      results = results.filter(
        (job:any) =>
          job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.location && filters.location !== "all") {
      results = results.filter((job:any) =>
        job.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.jobType && filters.jobType !== "all") {
      results = results.filter(
        (job:any) => job.work_type?.toLowerCase() === filters.jobType.toLowerCase()
      );
    }

    if (filters.experience && filters.experience !== "all") {
      results = results.filter(
        (job:any) =>
          job.experience_level?.toLowerCase() ===
          filters.experience.toLowerCase()
      );
    }

    setFilteredJobs(results);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilters({ location: "", jobType: "", experience: "" });
    setFilteredJobs(jobs);
  };

  const handleEditJob = (job:any) => {
    setEditingJobId(job.id);
    setEditingFields({
      title: job.title,
      company: job.company,
      description: job.description,
      location: job.location,
      work_type: job.work_type,
      experience_level: job.experience_level,
    });
  };

  const handleSubmitEdit = async () => {
    try {
      const res = await axios.patch(`${VITE_BACKEND_URL}/api/updatejobpost`, {
        id: editingJobId,
        ...editingFields,
      },{headers: {
        Authorization: `Bearer ${getAuthToken()}`
      }});

      const updatedJob = res.data.job;
      const updatedList = jobs.map((j:any) =>
        j.id === updatedJob.id ? updatedJob : j
      );
      setJobs((updatedList as any));
      setFilteredJobs((updatedList as any));
      setEditingJobId(null);
      toast({ title: "Job updated successfully" });
    } catch (err:any) {
      toast({
        title: "Update failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleDeleteJob = async (jobId:any) => {
    try {
      await axios.delete(`${VITE_BACKEND_URL}/api/deletejobpost/${jobId}`,{headers: {
        Authorization: `Bearer ${getAuthToken()}`
      }});
      const updated = jobs.filter((job:any) => job.id !== jobId);
      setJobs(updated);
      setFilteredJobs(updated);
      toast({ title: "Job deleted" });
    } catch (err:any) {
      toast({
        title: "Delete failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Recommended Jobs</h1>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search jobs, companies, or keywords"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {/* Filters */}
              <div>
                <Label>Location</Label>
                <Select
                  value={filters.location}
                  onValueChange={(val) =>
                    setFilters({ ...filters, location: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="san francisco">San Francisco</SelectItem>
                    <SelectItem value="new york">New York</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Job Type</Label>
                <Select
                  value={filters.jobType}
                  onValueChange={(val) =>
                    setFilters({ ...filters, jobType: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="on-site">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Experience</Label>
                <Select
                  value={filters.experience}
                  onValueChange={(val) =>
                    setFilters({ ...filters, experience: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="entry">Entry</SelectItem>
                    <SelectItem value="mid">Mid</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end space-x-2">
                <Button type="submit">Search</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetFilters}
                >
                  Reset
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Edit Form */}
        {editingJobId && (
          <div className="bg-yellow-100 border border-yellow-300 p-4 rounded mb-6">
            <h3 className="text-lg font-medium mb-2">Edit Job</h3>
            <Input
              placeholder="Job Title"
              value={editingFields.title}
              onChange={(e) =>
                setEditingFields({ ...editingFields, title: e.target.value })
              }
              className="mb-2"
            />
            <Input
              placeholder="Company"
              value={editingFields.company}
              onChange={(e) =>
                setEditingFields({ ...editingFields, company: e.target.value })
              }
              className="mb-2"
            />
            <Textarea
              rows={3}
              placeholder="Description"
              value={editingFields.description}
              onChange={(e) =>
                setEditingFields({
                  ...editingFields,
                  description: e.target.value,
                })
              }
              className="mb-2"
            />
            <Input
              placeholder="Location"
              value={editingFields.location}
              onChange={(e) =>
                setEditingFields({ ...editingFields, location: e.target.value })
              }
              className="mb-2"
            />
            <Input
              placeholder="Work Type"
              value={editingFields.work_type}
              onChange={(e) =>
                setEditingFields({
                  ...editingFields,
                  work_type: e.target.value,
                })
              }
              className="mb-2"
            />
            <Input
              placeholder="Experience Level"
              value={editingFields.experience_level}
              onChange={(e) =>
                setEditingFields({
                  ...editingFields,
                  experience_level: e.target.value,
                })
              }
              className="mb-2"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingJobId(null)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitEdit}>Update</Button>
            </div>
          </div>
        )}

        {/* Jobs List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Jobs Matching Your Profile
            </h2>
            <span className="text-gray-500">
              {filteredJobs.length} jobs found
            </span>
          </div>

          {filteredJobs.length > 0 ? (
            filteredJobs.map((job:any) => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                company={job.company} // 👈 just company name, no author name
                location={job.location}
                description={job.description}
                matchScore={null}
                tags={[job.experience_level, job.work_type]}
                logoUrl=""
                applyUrl={`/cover-letter?title=${encodeURIComponent(
                  job.title
                )}&company=${encodeURIComponent(job.company)}`}
                isOwnPost={job.author_id === user?.id}
                onEdit={() => handleEditJob(job)}
                onDelete={() => handleDeleteJob(job.id)}
                // authorName={job.author?.name} // 👈 pass author name separately if needed
              />
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No matching jobs found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters.
              </p>
              <Button onClick={handleResetFilters}>Reset Filters</Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default JobsPage;
