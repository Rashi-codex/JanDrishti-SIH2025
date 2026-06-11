import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  const categories = [
    "Infrastructure",
    "Roads & Traffic",
    "Waste Management",
    "Public Transportation",
    "Utilities",
    "Health & Hygiene",
  ];

  const handlePhotoUpload = (file: File) => {
    console.log("Selected file:", file);

    setFormData((prev) => ({
      ...prev,
      photo: file,
    }));

    const reader = new FileReader();

    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };

    reader.readAsDataURL(file);
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support location.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setFormData((prev) => ({
          ...prev,
          location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        }));

        toast({
          title: "Location Detected",
          description: "Your current location has been added.",
        });
      },
      () => {
        toast({
          title: "Location Permission Needed",
          description: "Allow location from browser and Windows settings.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.photo ||
      !formData.category ||
      !formData.description ||
      !formData.localAddress ||
      !formData.location
    ) {
      toast({
        title: "Missing Details",
        description: "Please fill all fields and upload photo.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );

      const fileExt = formData.photo.name.split(".").pop() || "jpg";

      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      const filePath = `reports/${fileName}`;

      console.log("Uploading file:", formData.photo);
      console.log("File path:", filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("issue-images")
        .upload(filePath, formData.photo, {
          cacheControl: "3600",
          upsert: false,
          contentType: formData.photo.type || "image/jpeg",
        });

      console.log("Upload data:", uploadData);
      console.log("Upload error:", uploadError);

      if (uploadError) {
        toast({
          title: "Image Upload Error",
          description: uploadError.message,
          variant: "destructive",
        });

        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("issue-images")
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      console.log("Image URL:", imageUrl);

      const reporterName =
        currentUser.fullName || currentUser.email || "User";

      const currentUserEmail = currentUser.email || "";

      console.log("Final image URL before insert:", imageUrl);

      const { data, error } = await supabase
        .from("issues")
        .insert({
          reporter_name: reporterName,
          user_email: currentUserEmail,
          category: formData.category,
          description: formData.description,
          local_address: formData.localAddress,
          location: formData.location,
          status: "submitted",
          image_url: imageUrl,
        } as any)
        .select();

      console.log("Inserted row:", data);
      console.log("Insert error:", error);

      if (error) {
        toast({
          title: "Database Error",
          description: error.message,
          variant: "destructive",
        });

        setLoading(false);
        return;
      }

      toast({
        title: "Report Submitted Successfully",
        description: "Your issue, image, and details have been saved.",
      });

      navigate("/track");
    } catch (error) {
      console.error("Submit error:", error);

      toast({
        title: "Error",
        description: "Something went wrong while submitting the issue.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setPhotoPreview(null);
                          setFormData((prev) => ({
                            ...prev,
                            photo: null,
                          }));
                        }}
                      >
                        Remove Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-center">
                      <Button
                        type="button"
                        variant="blue"
                        onClick={handleCameraCapture}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="ml-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload  File
                      </Button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handlePhotoUpload(file);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>

                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>

                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="min-h-[120px]"
                  maxLength={500}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Local Address</Label>

                <Input
                  value={formData.localAddress}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      localAddress: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>

                <div className="flex gap-2">
                  <Input
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    required
                  />

                  <Button
                    type="button"
                    variant="success"
                    onClick={detectLocation}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Detect
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full mt-8"
                size="lg"
                disabled={loading}
              >
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