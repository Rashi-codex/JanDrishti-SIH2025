import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/jan-dristi-logo.png";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    idType: "",
    idNumber: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const validateIdNumber = (type: string, number: string) => {
    switch (type) {
      case "aadhar":
        return /^\d{12}$/.test(number);
      case "pan":
        return /^[A-Z0-9]{10}$/.test(number);
      case "other":
        return /^[A-Z0-9]{1,16}$/.test(number);
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast({ title: "Weak Password", description: "Password must be at least 8 characters long.", variant: "destructive" });
      setLoading(false);
      return;
    }

    if (!validateIdNumber(formData.idType, formData.idNumber)) {
      toast({ title: "Invalid ID Number", description: "Please enter valid ID details.", variant: "destructive" });
      setLoading(false);
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        idType: formData.idType,
        idNumber: formData.idNumber,
      })
    );

    toast({
      title: "Account Created Successfully",
      description: "You are now signed in.",
    });

    setLoading(false);
    navigate("/home");
  };

  const getPlaceholder = () => {
    switch (formData.idType) {
      case "aadhar":
        return "Enter 12-digit Aadhar number";
      case "pan":
        return "Enter 10-character PAN number";
      case "other":
        return "Enter ID number";
      default:
        return "Select ID type first";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-soft">
        <CardContent className="p-8">
          <div className="flex items-center mb-6">
            <Link to="/login" className="mr-4">
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
            <span className="text-sm text-muted-foreground">Back to login</span>
          </div>

          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4">
              <img src={logo} alt="Jan Dristi" className="w-full h-full object-cover rounded-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">join us</h1>
            <p className="text-muted-foreground">Create your account to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <Input value={formData.mobileNumber} onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })} required />
            </div>

            <div className="space-y-2">
              <Label>Government ID</Label>
              <Select value={formData.idType} onValueChange={(value) => setFormData({ ...formData, idType: value, idNumber: "" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aadhar">Aadhar</SelectItem>
                  <SelectItem value="pan">PAN</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.idType && (
              <div className="space-y-2">
                <Label>ID Number</Label>
                <Input
                  placeholder={getPlaceholder()}
                  value={formData.idNumber}
                  onChange={(e) => {
                    let value = e.target.value.toUpperCase();
                    if (formData.idType === "aadhar") value = value.replace(/\D/g, "").slice(0, 12);
                    else if (formData.idType === "pan") value = value.slice(0, 10);
                    else value = value.slice(0, 16);
                    setFormData({ ...formData, idNumber: value });
                  }}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <div className="relative">
                <Input type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" variant="gradient" className="w-full mt-6" disabled={loading}>
              {loading ? "Creating account..." : "create account"}
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-muted-foreground">Already have an account?</p>
            <Link to="/login" className="font-semibold text-foreground hover:text-primary">Sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;