import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
const ReportIssue = () => {
  const [formData, setFormData] = useState({
    photo: null as File | null,
    category: "",
    description: "",
    localAddress: "",
    location: "",
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const categories = ["Infrastructure", "Roads & Traffic", "Waste Management", "Public Transportation", "Utilities", "Health & Hygiene"];

  const handlePhotoUpload = (file: File) => {
    setFormData({ ...formData, photo: file });
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = () => {
    fileInputRef.current?.setAttribute("capture", "environment");
    fileInputRef.current?.click();
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation Not Supported", description: "Your browser does not support location.", variant: "destructive" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        }));
        toast({ title: "Location Detected", description: "Your current location has been added." });
      },
      () => {
        toast({
          title: "Location Permission Needed",
          description: "Allow location from browser and Windows settings.",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.photo || !formData.category || !formData.description || !formData.localAddress || !formData.location) {
      toast({ title: "Missing Details", description: "Please fill all fields and upload photo.", variant: "destructive" });
      return;
    }

    setLoading(true);

    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

    const newIssue = {
      id: `ISS-${Date.now()}`,
      title: formData.description.length > 50 ? formData.description.slice(0, 50) + "..." : formData.description,
      category: formData.category,
      status: "submitted",
      date: new Date().toISOString().split("T")[0],
      description: formData.description,
      localAddress: formData.localAddress,
      location: formData.location,
      reporter: currentUser.fullName || currentUser.email || "User",
    };
  const currentUserEmail = currentUser.email || "";

  const { error } = await supabase.from("issues").insert({
    reporter_name: newIssue.reporter,
    user_email: currentUserEmail,
    category: newIssue.category,
    description: newIssue.description,
    local_address: newIssue.localAddress,
    location: newIssue.location,
    status: newIssue.status,
  } as any);

if (error) {
  toast({
    title: "Database Error",
    description: error.message,
    variant: "destructive",
  });
  setLoading(false);
  return;
}

    toast({ title: "Report Submitted Successfully", description: "Your issue has been saved." });

    setLoading(false);
    navigate("/track");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <Link to="/home" className="mr-4">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <h1 className="text-xl font-semibold">Report Issue</h1>
        </div>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base font-medium">Upload Photo</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  {photoPreview ? (
                    <div className="space-y-4">
                      <img src={photoPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                      <Button type="button" variant="outline" onClick={() => { setPhotoPreview(null); setFormData({ ...formData, photo: null }); }}>
                        Remove Photo
                      </Button>
                    </div>
                  ) : (
                    <Button type="button" variant="blue" onClick={handleCameraCapture}>
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[120px]"
                  maxLength={500}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Local Address</Label>
                <Input value={formData.localAddress} onChange={(e) => setFormData({ ...formData, localAddress: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <div className="flex gap-2">
                  <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
                  <Button type="button" variant="success" onClick={detectLocation}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Detect
                  </Button>
                </div>
              </div>

              <Button type="submit" variant="gradient" className="w-full mt-8" size="lg" disabled={loading}>
                {loading ? "Submitting..." : "Submit Issue Report"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportIssue;