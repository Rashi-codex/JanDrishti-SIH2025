import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/jan-dristi-logo.png";
import { supabase } from "@/integrations/supabase/client";

interface Issue {
  id: string;
  title: string;
  reporter?: string;
  status: "submitted" | "pending" | "under process" | "resolved";
}

const Feedback = () => {
  const [searchParams] = useSearchParams();
  const issueId = searchParams.get("issueId");

  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    const loadIssue = async () => {
      setLoading(true);

      let query = supabase.from("issues").select("*");

      if (issueId) {
        query = query.eq("id", issueId);
      } else {
        query = query.order("created_at", { ascending: false }).limit(1);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error loading issue:", error);
        setIssue(null);
        setLoading(false);
        return;
      }

      const row : any = data?.[0];

      if (!row) {
        setIssue(null);
        setLoading(false);
        return;
      }

      setIssue({
        id: row.id,
        title:
          row.description && row.description.length > 50
            ? row.description.slice(0, 50) + "..."
            : row.description || "Civic Issue",
        reporter: row.reporter_name || "User",
        status: (row.status || "submitted") as Issue["status"],
      });

      setLoading(false);
    };

    loadIssue();
  }, [issueId]);

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleSubmit = async () => {
    if (selectedRating === null) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!issue) {
      toast({
        title: "Issue Missing",
        description: "No issue found for feedback.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("feedback").insert({
      issue_id: issue.id,
      rating: selectedRating,
      feedback: feedbackText,
    } as any);

    if (error) {
      toast({
        title: "Database Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Feedback Submitted",
      description:
        "Thank you for your feedback! It helps us improve our services.",
    });

    setSelectedRating(null);
    setFeedbackText("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-2xl mx-auto p-6">
          <p className="text-muted-foreground">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-2xl mx-auto p-6">
          <div className="flex items-center mb-6">
            <Link to="/track" className="mr-4">
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
            <h1 className="text-xl font-semibold">Feedback</h1>
          </div>

          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No issue found for feedback.
              </p>

              <Link to="/track" className="inline-block mt-4">
                <Button variant="outline">Back to Track Issues</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <Link to="/track" className="mr-4">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>

          <h1 className="text-xl font-semibold">Feedback</h1>
        </div>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Rate your experience</CardTitle>

            <Link to="/track">
              <X className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </Link>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium text-sm text-muted-foreground mb-1">
                Issue: {issue.id}
              </h3>

              <p className="text-foreground">{issue.title}</p>

              {issue.reporter && (
                <p className="text-sm text-muted-foreground mt-1">
                  Reported by: {issue.reporter}
                </p>
              )}
            </div>

            <div className="text-center space-y-4">
              <h2 className="text-lg font-medium text-foreground">
                What was the level of your satisfaction with the issue
                resolution?
              </h2>

              <div className="flex flex-wrap justify-center gap-3">
                {[0, 1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingClick(rating)}
                    className={`w-12 h-12 rounded-full border-2 transition-all duration-200 font-medium ${
                      selectedRating === rating
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50 text-foreground"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-3 mt-3">
                {[6, 7, 8, 9, 10].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingClick(rating)}
                    className={`w-12 h-12 rounded-full border-2 transition-all duration-200 font-medium ${
                      selectedRating === rating
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50 text-foreground"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>

              <div className="flex justify-between text-sm text-muted-foreground mt-4">
                <span>0 - Extremely Unsatisfied</span>
                <span>10 - Extremely Satisfied</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                What is the main reason for the score?
              </label>

              <Textarea
                placeholder="Your feedback is valuable to us"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <img src={logo} alt="Jan-dristi" className="h-6" />
                <span className="text-sm font-medium text-foreground">
                  Jan-dristi
                </span>
              </div>

              <Button
                onClick={handleSubmit}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              >
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Feedback;