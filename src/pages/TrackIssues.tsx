import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Search,
  MapPin,
  Calendar,
  User,
  MessageSquare,
} from "lucide-react";

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
  image_url?: string;
  statusUpdates?: Array<{
    message: string;
    date: string;
  }>;
}

const TrackIssues = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIssues = async () => {
      setLoading(true);

      const { data, error } = await (supabase as any)
        .from("issues")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading issues:", error);
        setIssues([]);
        setLoading(false);
        return;
      }

      const formattedIssues: Issue[] = (data || []).map((item: any) => ({
        id: item.id,
        title:
          item.description && item.description.length > 50
            ? item.description.slice(0, 50) + "..."
            : item.description || "Civic Issue",
        category: item.category || "General",
        status: item.status || "submitted",
        date: item.created_at
          ? new Date(item.created_at).toISOString().split("T")[0]
          : "",
        description: item.description,
        localAddress: item.local_address,
        location: item.location,
        reporter: item.reporter_name,
        image_url: item.image_url,
        statusUpdates: [
          {
            message: "Issue reported and logged in system",
            date: item.created_at
              ? new Date(item.created_at).toISOString().split("T")[0]
              : "",
          },
          {
            message: "Initial report received",
            date: item.created_at
              ? new Date(item.created_at).toISOString().split("T")[0]
              : "",
          },
        ],
      }));

      setIssues(formattedIssues);
      setLoading(false);
    };

    loadIssues();
  }, []);

  const filteredIssues = issues.filter(
    (issue) =>
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (status === "under process") return "In Progress";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  const deleteIssue = async (issueId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this issue? This action cannot be undone."
    );
    if (!confirmDelete) return;
    const { error } = await (supabase as any)
      .from("issues")
      .delete()
      .eq("id", issueId);
    if (error) {
      console.error("Error deleting issue:", error);
      alert("Failed to delete the issue. Please try again.");
    }
    setIssues((prevIssues) => prevIssues.filter((issue) => issue.id !== issueId));
  }

  const firstIssueId = filteredIssues.length > 0 ? filteredIssues[0].id : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <Link to="/home" className="mr-4">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <h1 className="text-xl font-semibold">Track Issues</h1>
        </div>

        <Card className="mb-6 shadow-card">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by issue ID, title, category, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          {firstIssueId ? (
            <Link to={`/feedback?issueId=${firstIssueId}`}>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Give Feedback
              </Button>
            </Link>
          ) : (
            <Link to="/report">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                Report an issue first
              </Button>
            </Link>
          )}
        </div>

        <div className="space-y-6">
          {loading ? (
            <Card className="shadow-card">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Loading issues...</p>
              </CardContent>
            </Card>
          ) : filteredIssues.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No issues found matching your search.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredIssues.map((issue) => (
              <Card key={issue.id} className="shadow-card">
                <CardContent className="p-6">
                  {issue.image_url && (
                    <img
                      src={issue.image_url}
                      alt="Issue"
                      className="w-full h-56 object-cover rounded-lg mb-4 border"
                    />
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {issue.title}
                        </h3>

                        <Badge
                          className={`${getStatusColor(
                            issue.status
                          )} border-0`}
                        >
                          {getStatusText(issue.status)}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-1">
                        ID: {issue.id}
                      </p>

                      {issue.description && (
                        <p className="text-muted-foreground mb-3">
                          {issue.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                    {issue.localAddress && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {issue.localAddress}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Reported: {issue.date}
                      </span>
                    </div>

                    {issue.reporter && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {issue.reporter}
                        </span>
                      </div>
                    )}
                  </div>

                  {issue.location && (
                    <div className="mb-4">
                      <a
                        href={`https://www.google.com/maps?q=${encodeURIComponent(
                          issue.location
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 text-sm underline"
                      >
                        View on Map
                      </a>
                    </div>
                  )}

                  {issue.statusUpdates && issue.statusUpdates.length > 0 && (
                    <div>
                      <h4 className="font-medium text-foreground mb-3">
                        Status Updates
                      </h4>

                      <div className="space-y-3">
                        {issue.statusUpdates.map((update, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>

                            <div className="flex-1">
                              <p className="text-sm text-foreground">
                                {update.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {update.date}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteIssue(issue.id)}
                    >
                      Delete Issue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackIssues;