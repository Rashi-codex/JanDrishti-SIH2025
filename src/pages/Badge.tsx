import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Award } from "lucide-react";
import bronzeBadge from "@/assets/bronze-badge.jpg";
import silverBadge from "@/assets/silver-badge.jpg";
import goldBadge from "@/assets/gold-badge.jpg";
import logo from "@/assets/jan-dristi-logo.png";
import { supabase } from "@/integrations/supabase/client";

interface Issue {
  id: string;
  title?: string;
  category: string;
  status: "submitted" | "pending" | "under process" | "resolved" | "active";
  date?: string;
}

const Badge = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    const loadBadgeData = async () => {
      const user = localStorage.getItem("currentUser");
      if (user) {
        setCurrentUser(JSON.parse(user));
      }
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      if (!currentUser.email) {
        setIssues([]);
        return;
      }

      const { data, error } = await (supabase as any )
        .from("issues")
        .select("*")
        .eq("user_email",currentUser.email)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading badge data:", error);
        setIssues([]);
        return;
      }

      setIssues((data || []) as any);
    };

    loadBadgeData();
  }, []);

  const getUserStats = () => {
    const totalReports = issues.length;
    const resolvedIssues = issues.filter(
      (issue) => issue.status === "resolved"
    ).length;

    return { totalReports, resolvedIssues };
  };

  const getBadgeType = () => {
    const { totalReports, resolvedIssues } = getUserStats();

    if (totalReports === 0) return "none";
    if (totalReports >= 10 && resolvedIssues >= 10) return "gold";
    if (totalReports >= 5 && resolvedIssues >= 5) return "silver";
    if (totalReports >= 1) return "bronze";

    return "none";
  };

  const getBadgeImage = () => {
    const badgeType = getBadgeType();

    switch (badgeType) {
      case "gold":
        return goldBadge;
      case "silver":
        return silverBadge;
      case "bronze":
        return bronzeBadge;
      default:
        return null;
    }
  };

  const getBadgeTitle = () => {
    const badgeType = getBadgeType();

    switch (badgeType) {
      case "gold":
        return "Gold Badge";
      case "silver":
        return "Silver Badge";
      case "bronze":
        return "Bronze Badge";
      default:
        return "No Badge Earned";
    }
  };

  const getBadgeDescription = () => {
    const badgeType = getBadgeType();
    const { totalReports, resolvedIssues } = getUserStats();

    switch (badgeType) {
      case "gold":
        return `Congratulations! You've earned the Gold Badge for reporting ${totalReports} issues with ${resolvedIssues} resolved.`;
      case "silver":
        return `Great work! You've earned the Silver Badge for reporting ${totalReports} issues with ${resolvedIssues} resolved.`;
      case "bronze":
        return "Well done! You've earned the Bronze Badge for your first successful report.";
      default:
        return "Start reporting issues to earn your first badge!";
    }
  };

  const getNextBadgeRequirement = () => {
    const badgeType = getBadgeType();
    const { totalReports, resolvedIssues } = getUserStats();

    switch (badgeType) {
      case "gold":
        return null;
      case "silver":
        return `Gold Badge: Report ${Math.max(
          0,
          10 - totalReports
        )} more issues and get ${Math.max(
          0,
          10 - resolvedIssues
        )} more resolved.`;
      case "bronze":
        return `Silver Badge: Report ${Math.max(
          0,
          5 - totalReports
        )} more issues and get ${Math.max(
          0,
          5 - resolvedIssues
        )} more resolved.`;
      default:
        return "Bronze Badge: Report your first issue to get started!";
    }
  };

  const badgeImage = getBadgeImage();
  const { totalReports, resolvedIssues } = getUserStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/home")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="w-10 h-10">
              <img
                src={logo}
                alt="Jan Dristi"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            <h1 className="text-xl font-bold text-foreground">
              Jan Dristi - Badges
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="border-0 bg-gradient-blue shadow-soft">
            <CardContent className="p-6 text-center text-white">
              <Award className="h-8 w-8 mx-auto mb-2" />
              <div className="text-sm mb-1">Total Reports</div>
              <div className="text-3xl font-bold">{totalReports}</div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-cyan shadow-soft">
            <CardContent className="p-6 text-center text-white">
              <Award className="h-8 w-8 mx-auto mb-2" />
              <div className="text-sm mb-1">Resolved Issues</div>
              <div className="text-3xl font-bold">{resolvedIssues}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card mb-6">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              {getBadgeTitle()}
            </h2>

            {badgeImage ? (
              <div className="mb-6">
                <img
                  src={badgeImage}
                  alt={getBadgeTitle()}
                  className="w-64 h-64 mx-auto object-contain"
                />

                <div className="mt-4">
                  <p className="text-lg font-semibold text-foreground">
                    {currentUser?.fullName || currentUser?.email || "User"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <div className="w-64 h-64 mx-auto bg-muted rounded-lg flex items-center justify-center">
                  <Award className="h-24 w-24 text-muted-foreground" />
                </div>
              </div>
            )}

            <p className="text-muted-foreground mb-4">
              {getBadgeDescription()}
            </p>

            {getNextBadgeRequirement() && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium text-foreground">
                  Next Goal: {getNextBadgeRequirement()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-foreground">
              Badge Requirements
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <h4 className="font-medium text-foreground">Bronze Badge</h4>
                  <p className="text-sm text-muted-foreground">
                    Report your first issue
                  </p>
                </div>
                <span className="text-amber-600 font-semibold">1 Report</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <h4 className="font-medium text-foreground">Silver Badge</h4>
                  <p className="text-sm text-muted-foreground">
                    Report 5+ issues with 5+ resolved
                  </p>
                </div>
                <span className="text-gray-600 font-semibold">
                  5 Reports + 5 Resolved
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <h4 className="font-medium text-foreground">Gold Badge</h4>
                  <p className="text-sm text-muted-foreground">
                    Report 10+ issues with 10+ resolved
                  </p>
                </div>
                <span className="text-yellow-600 font-semibold">
                  10 Reports + 10 Resolved
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Badge;