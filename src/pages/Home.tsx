import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Menu, CheckCircle, Clock, Users, User, LogOut, Search, Filter, Award } from "lucide-react";

import logo from "@/assets/jan-dristi-logo.png";

interface Issue {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
  user_id: string;
}

const Home = () => {
  const [profile, setProfile] = useState<any>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = { email: "demo@gmail.com" };
  const signOut = async () => {
    navigate("/login");
  };

  useEffect(() => {
    setLoading(false);

    setProfile({
      full_name: "Demo User",
    });

  setIssues([]);
  }, []);
    

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const resolvedCount = issues.filter(issue => issue.status === "resolved").length;
  const pendingCount = issues.filter(issue => issue.status === "pending").length;
  const activeCount = issues.filter(issue => issue.status === "active").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10">
              <img src={logo} alt="Jan Dristi" className="w-full h-full object-cover rounded-lg" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Jan Dristi</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/badge">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground"
              >
                <Award className="h-4 w-4 mr-2" />
                Badge
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {profile?.full_name || user?.email || "User"}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/report">
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-blue shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-center text-white">
                  <Plus className="h-8 w-8 mr-3" />
                  <span className="text-xl font-semibold">Report issue</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/track">
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-blue shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-center text-white">
                  <Menu className="h-8 w-8 mr-3" />
                  <span className="text-xl font-semibold">Track issue</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 bg-gradient-cyan shadow-soft">
            <CardContent className="p-6 text-center text-white">
              <CheckCircle className="h-8 w-8 mx-auto mb-2" />
              <div className="text-sm mb-1">Resolved issue</div>
              <div className="text-3xl font-bold">{resolvedCount}</div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-cyan shadow-soft">
            <CardContent className="p-6 text-center text-white">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <div className="text-sm mb-1">Pending issue</div>
              <div className="text-3xl font-bold">{pendingCount}</div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-cyan shadow-soft">
            <CardContent className="p-6 text-center text-white">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <div className="text-sm mb-1">Active users</div>
              <div className="text-3xl font-bold">42</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search issue" 
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="roads">Roads</SelectItem>
                    <SelectItem value="parks">Parks</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select>
                  <SelectTrigger className="w-[120px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Issues */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-center">Recent issues</h2>
            
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : issues.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No issues reported yet</div>
              ) : (
                issues.slice(0, 5).map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div>
                      <h3 className="font-medium text-foreground">{issue.title}</h3>
                      <p className="text-sm text-muted-foreground">{issue.category} • {new Date(issue.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Home;