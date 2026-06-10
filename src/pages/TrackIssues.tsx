import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, MapPin, Calendar, User, MessageSquare } from "lucide-react";

interface Issue {
  id: string;
  title: string;
  category: string;
  status: "submitted" | "pending" | "under process" | "resolved";
  date: string;
  description?: string;
  localAddress?: string;
  location?: string;
  reporter?: string;
  statusUpdates?: Array<{
    message: string;
    date: string;
  }>;
}

const TrackIssues = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Load issues from localStorage with sample data
    const savedIssues = localStorage.getItem("issues");
    if (savedIssues) {
      const parsedIssues = JSON.parse(savedIssues);
      // Add sample status updates for demonstration
      const issuesWithUpdates = parsedIssues.map((issue: Issue, index: number) => ({
        ...issue,
        statusUpdates: index === 0 ? [
          { message: "Technician assigned to investigate the issue", date: "2025-09-12" },
          { message: "Issue reported and logged in system", date: "2025-09-11" },
          { message: "Initial report received", date: "2025-09-10" }
        ] : index === 1 ? [
          { message: "Pothole repair completed and road reopened", date: "2025-09-11" },
          { message: "Road crew dispatched for repair", date: "2025-09-10" },
          { message: "Issue verified by inspection team", date: "2025-09-09" },
          { message: "Initial report received", date: "2025-09-08" }
        ] : [
          { message: "Initial report received", date: new Date().toISOString().split('T')[0] }
        ]
      }));
      setIssues(issuesWithUpdates);
    } else {
      // Sample data
      setIssues([
        {
          id: "ISS-001",
          title: "Broken streetlight on Main St",
          category: "Infrastructure",
          status: "under process",
          date: "2025-09-10",
          description: "The streetlight has been flickering and went out completely last night.",
          localAddress: "Main Street & 1st Ave",
          reporter: "John Doe",
          statusUpdates: [
            { message: "Technician assigned to investigate the issue", date: "2025-09-12" },
            { message: "Issue reported and logged in system", date: "2025-09-11" },
            { message: "Initial report received", date: "2025-09-10" }
          ]
        },
        {
          id: "ISS-002",
          title: "Pothole near school",
          category: "Roads & Traffic",
          status: "resolved",
          date: "2025-09-08",
          description: "Large pothole is causing traffic hazards near the school zone.",
          localAddress: "Oak Street near Elementary School",
          reporter: "Jane Smith",
          statusUpdates: [
            { message: "Pothole repair completed and road reopened", date: "2025-09-11" },
            { message: "Road crew dispatched for repair", date: "2025-09-10" },
            { message: "Issue verified by inspection team", date: "2025-09-09" },
            { message: "Initial report received", date: "2025-09-08" }
          ]
        }
      ]);
    }
  }, []);

  const filteredIssues = issues.filter(issue =>
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "under process":
        return "bg-purple-100 text-purple-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "under process":
        return "In Progress";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <Link to="/home" className="mr-4">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <h1 className="text-xl font-semibold">Track Issues</h1>
        </div>

        {/* Search */}
        <Card className="mb-6 shadow-card">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by issue ID or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Feedback Button */}
        <div className="mb-6">
          <Link to="/feedback">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Give Feedback
            </Button>
          </Link>
        </div>

        {/* Issues List */}
        <div className="space-y-6">
          {filteredIssues.map((issue) => (
            <Card key={issue.id} className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{issue.title}</h3>
                      <Badge className={`${getStatusColor(issue.status)} border-0`}>
                        {getStatusText(issue.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">ID: {issue.id}</p>
                    {issue.description && (
                      <p className="text-muted-foreground mb-3">{issue.description}</p>
                    )}
                  </div>
                </div>

                {/* Issue Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                  {issue.localAddress && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{issue.localAddress}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Reported: {issue.date}</span>
                  </div>
                  {issue.reporter && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{issue.reporter}</span>
                    </div>
                  )}
                </div>

                {/* Status Updates */}
                {issue.statusUpdates && issue.statusUpdates.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Status Updates</h4>
                    <div className="space-y-3">
                      {issue.statusUpdates.map((update, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground">{update.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{update.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredIssues.length === 0 && (
            <Card className="shadow-card">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No issues found matching your search.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackIssues; 