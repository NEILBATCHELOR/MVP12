import React from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

function ReviewStep() {
  const { formData, isDevelopmentMode } = useOnboarding();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (isDevelopmentMode) {
      toast({
        title: 'Development Mode',
        description: 'Form would be submitted in production mode.',
      });
      navigate('/compliance/dashboard');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Success',
        description: 'Your onboarding information has been submitted successfully.',
      });
      
      navigate('/compliance/dashboard');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit onboarding information. Please try again.',
      });
    }
  };

  const formatValue = (value: any): string => {
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const renderSection = (title: string, data: Record<string, any>) => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p className="font-medium">{formatValue(value)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const {
    // Registration data
    fullName,
    email,
    investorType,
    country,
    // Profile data
    companyName,
    jobTitle,
    phoneNumber,
    dateOfBirth,
    investmentExperience,
    investmentGoals,
    riskTolerance,
    preferredInvestmentSize,
    // Document data
    documentData,
  } = formData;

  return (
    <div className="space-y-6">
      {isDevelopmentMode && (
        <Alert>
          <AlertDescription>
            Development mode is enabled. Form submission will be simulated.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6 space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Review Your Information</h2>
          <p className="text-muted-foreground">
            Please review your information before submitting.
          </p>
        </div>

        {/* Registration Information */}
        {renderSection('Registration Information', {
          fullName,
          email,
          investorType,
          country,
        })}

        {/* Profile Information */}
        {renderSection('Profile Information', {
          companyName,
          jobTitle,
          phoneNumber,
          dateOfBirth,
          investmentExperience,
          investmentGoals,
          riskTolerance,
          preferredInvestmentSize,
        })}

        {/* Document Information */}
        {documentData && renderSection('Document Information', documentData)}

        <div className="pt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            By submitting this form, you confirm that all provided information is accurate and complete.
          </p>
          <Button onClick={handleSubmit} className="w-full">
            Submit Onboarding Information
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default ReviewStep; 