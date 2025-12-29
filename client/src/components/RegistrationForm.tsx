import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useRegister } from "@/hooks/useAuth";

interface RegistrationFormProps {
  onSubmit?: (data: RegistrationData) => void;
  onCancel?: () => void;
}

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  matricNumber: string;
  gender: string;
  location: string;
  address: string;
  phoneNumber: string;
  guardianPhoneNumber: string;
  level: string;
  occupation?: string;
}

export default function RegistrationForm({ onSubmit, onCancel }: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    matricNumber: "",
    gender: "",
    location: "",
    address: "",
    phoneNumber: "",
    guardianPhoneNumber: "",
    level: "",
    occupation: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [, setLocation] = useLocation();
  const registerMutation = useRegister();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm password is required";
    if (!formData.matricNumber.trim()) newErrors.matricNumber = "Matric number is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    if (!formData.guardianPhoneNumber.trim()) newErrors.guardianPhoneNumber = "Guardian phone number is required";
    if (!formData.level) newErrors.level = "Level is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Matric number validation (must contain "soc")
    if (formData.matricNumber && !formData.matricNumber.toLowerCase().includes("soc")) {
      newErrors.matricNumber = "Matric number must contain 'soc'";
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms agreement
    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Prepare registration data (exclude confirmPassword)
    const { confirmPassword, ...registrationData } = formData;
    
    registerMutation.mutate(registrationData, {
      onSuccess: () => {
        // Redirect to login page on successful registration
        setLocation('/login');
        onSubmit?.(formData);
      },
      onError: (error: any) => {
        setErrors({ form: error.message || "Registration failed. Please try again." });
      }
    });
  };

  // Calculate form completion percentage
  const completedFields = Object.values(formData).filter(value => value.trim() !== "").length;
  const totalRequiredFields = 11; // Updated to include guardian phone
  const completionPercentage = Math.round((completedFields / totalRequiredFields) * 100);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Student Registration</CardTitle>
            <CardDescription>
              Join the Nsasa community and start your academic journey with us
            </CardDescription>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Profile Completion</span>
            <span>{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Enter your first name"
                  data-testid="input-first-name"
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Enter your last name"
                  data-testid="input-last-name"
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  data-testid="input-email"
                />
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Create a password"
                  data-testid="input-password"
                />
                {errors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Confirm your password"
                  data-testid="input-confirm-password"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="matricNumber">Matric Number *</Label>
              <Input
                id="matricNumber"
                value={formData.matricNumber}
                onChange={(e) => handleInputChange("matricNumber", e.target.value)}
                placeholder="Enter your matric number (must contain 'soc')"
                data-testid="input-matric"
              />
              {errors.matricNumber && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.matricNumber}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Only students from the Department of Sociology are eligible (matric number must contain 'soc')
              </p>
            </div>
          </div>

          {/* Demographics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Demographics</h3>
            
            <div className="space-y-3">
              <Label>Gender *</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => handleInputChange("gender", value)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" data-testid="radio-male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" data-testid="radio-female" />
                  <Label htmlFor="female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" data-testid="radio-other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
              {errors.gender && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.gender}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                  <SelectTrigger data-testid="select-location">
                    <SelectValue placeholder="Select your location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OnCampus">On Campus</SelectItem>
                    <SelectItem value="OffCampus">Off Campus</SelectItem>
                  </SelectContent>
                </Select>
                {errors.location && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.location}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Academic Level *</Label>
                <Select value={formData.level} onValueChange={(value) => handleInputChange("level", value)}>
                  <SelectTrigger data-testid="select-level">
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100 Level</SelectItem>
                    <SelectItem value="200">200 Level</SelectItem>
                    <SelectItem value="300">300 Level</SelectItem>
                    <SelectItem value="400">400 Level</SelectItem>
                    <SelectItem value="postgraduate">Postgraduate</SelectItem>
                  </SelectContent>
                </Select>
                {errors.level && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.level}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="address">
                {formData.location === "OnCampus" ? "Hostel Address" : "Off-Campus Address"} *
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder={
                  formData.location === "OnCampus" 
                    ? "Enter your hostel name and room number" 
                    : "Enter your off-campus address"
                }
                rows={3}
                data-testid="textarea-address"
              />
              {errors.address && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.address}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  placeholder="Enter your phone number"
                  data-testid="input-phone"
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardianPhoneNumber">Guardian Phone Number *</Label>
                <Input
                  id="guardianPhoneNumber"
                  value={formData.guardianPhoneNumber}
                  onChange={(e) => handleInputChange("guardianPhoneNumber", e.target.value)}
                  placeholder="Enter guardian's phone number"
                  data-testid="input-guardian-phone"
                />
                {errors.guardianPhoneNumber && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.guardianPhoneNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation (Optional)</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange("occupation", e.target.value)}
                  placeholder="Enter your occupation"
                  data-testid="input-occupation"
                />
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                data-testid="checkbox-terms"
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed">
                I agree to the <Button variant="ghost" className="p-0 h-auto text-sm underline">Terms and Conditions</Button> and{" "}
                <Button variant="ghost" className="p-0 h-auto text-sm underline">Privacy Policy</Button>. 
                I understand that my registration is subject to admin approval.
              </Label>
            </div>
            {errors.terms && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.terms}
              </p>
            )}
          </div>

          {/* Important Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your registration will be reviewed by our admin team. You will receive an email notification 
              once your account has been approved. This process typically takes 1-2 business days.
            </AlertDescription>
          </Alert>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="flex-1"
              data-testid="button-submit"
            >
              {registerMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Registration
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}