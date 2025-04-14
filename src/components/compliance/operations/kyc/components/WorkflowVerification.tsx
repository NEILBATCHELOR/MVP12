import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, CheckCircle } from "lucide-react";
import { OnfidoService } from '../services/onfidoService';
import dynamic from 'next/dynamic';
import type { ComplianceCheck } from '../../types';
import type { OnfidoComplete, OnfidoError, OnfidoSDKOptions } from '@/types/onfido';
import type { ComponentType } from 'react';

// Custom type for the Script component props
interface ScriptProps {
  src: string;
  onLoad?: () => void;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';
}

// Create a wrapper component for Script to handle the props correctly
const ScriptComponent = ({ src, onLoad, strategy }: ScriptProps) => {
  const NextScript = require('next/script').default;
  return <NextScript src={src} onLoad={onLoad} strategy={strategy} />;
};

// Use dynamic import for the Script component with proper types
const DynamicScript = dynamic<ScriptProps>(
  () => Promise.resolve(ScriptComponent as ComponentType<ScriptProps>),
  { ssr: false }
);

// Extend the Window interface to include the Onfido SDK
declare global {
  interface Window {
    Onfido: {
      init: (options: OnfidoSDKOptions) => { tearDown: () => void };
    };
  }
}

interface WorkflowVerificationProps {
  investorId: string;
  applicantId: string;
  workflowId: string;
  onComplete: (result: ComplianceCheck) => void;
  onError: (error: Error) => void;
}

// Extend OnfidoSDKOptions to support workflow-specific properties
interface WorkflowSDKOptions extends Omit<OnfidoSDKOptions, 'workflowRunId'> {
  workflowRunId: string;
}

export const WorkflowVerification: React.FC<WorkflowVerificationProps> = ({
  investorId,
  applicantId,
  workflowId,
  onComplete,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sdkToken, setSdkToken] = useState<string | null>(null);
  const [workflowRunId, setWorkflowRunId] = useState<string | null>(null);
  const [status, setStatus] = useState<'not_started' | 'in_progress' | 'completed' | 'error'>('not_started');
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isScriptLoaded && sdkToken && workflowRunId) {
      initWorkflowSdk();
    }
  }, [isScriptLoaded, sdkToken, workflowRunId]);

  const startWorkflow = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const onfidoService = OnfidoService.getInstance();
      
      // Start the workflow
      const workflowResult = await onfidoService.startWorkflow(applicantId, workflowId);
      setWorkflowRunId(workflowResult.id);
      
      // Generate a token
      const tokenResult = await onfidoService.createSdkToken(
        applicantId,
        window.location.origin
      );
      
      setSdkToken(tokenResult.token);
      setStatus('in_progress');
    } catch (err) {
      console.error('Error starting workflow:', err);
      setError(err instanceof Error ? err.message : 'Failed to start workflow');
      setStatus('error');
      onError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const initWorkflowSdk = () => {
    if (!window.Onfido || !sdkToken || !workflowRunId) return;
    
    try {
      const container = document.getElementById('workflow-mount');
      if (!container) return;
      
      // Create a combined options object with all required properties
      const options: WorkflowSDKOptions = {
        token: sdkToken,
        containerId: 'workflow-mount',
        onComplete: handleWorkflowComplete,
        onError: handleWorkflowError,
        workflowRunId: workflowRunId
      };
      
      // Initialize the Onfido SDK with the workflow options
      const onfido = window.Onfido.init(options as unknown as OnfidoSDKOptions);
      
      return () => {
        if (onfido && typeof onfido.tearDown === 'function') {
          onfido.tearDown();
        }
      };
    } catch (err) {
      console.error('Error initializing workflow:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize workflow');
      setStatus('error');
      onError(err as Error);
    }
  };

  const handleWorkflowComplete = async (data: OnfidoComplete) => {
    console.log('Workflow verification completed:', data);
    setStatus('completed');
    
    try {
      if (!applicantId) return;
      
      // Create a ComplianceCheck object
      const complianceCheck: ComplianceCheck = {
        id: crypto.randomUUID(),
        type: 'KYC',
        status: 'IN_PROGRESS',
        details: {
          provider: 'onfido',
          applicantId: applicantId,
          workflowId: workflowId,
          workflowRunId: workflowRunId,
          documentCapture: data.document,
          selfieCapture: data.face
        },
        createdAt: new Date(),
      };
      
      onComplete(complianceCheck);
    } catch (err) {
      console.error('Error creating compliance check:', err);
      setError(err instanceof Error ? err.message : 'Failed to create compliance check');
      onError(err as Error);
    }
  };

  const handleWorkflowError = (err: OnfidoError) => {
    console.error('Workflow error:', err);
    setError(`Verification error: ${err.message}`);
    setStatus('error');
    onError(err as unknown as Error);
  };

  const handleRetry = () => {
    setStatus('not_started');
    setError(null);
    setSdkToken(null);
    setWorkflowRunId(null);
  };

  return (
    <>
      <DynamicScript
        src="https://assets.onfido.com/web-sdk-releases/latest/onfido.min.js"
        onLoad={() => setIsScriptLoaded(true)}
        strategy="afterInteractive"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Workflow Verification</CardTitle>
          <CardDescription>
            Complete your advanced identity verification process
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'not_started' && (
            <div className="text-center py-8">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Spinner size="lg" />
                  <p>Setting up verification workflow...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Button onClick={startWorkflow}>
                    Start Workflow Verification
                  </Button>
                </div>
              )}
            </div>
          )}

          {status === 'in_progress' && (
            <div id="workflow-mount" className="min-h-[500px]"></div>
          )}

          {status === 'completed' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Workflow Completed</h3>
                <p className="text-muted-foreground">
                  Your identity verification workflow has been successfully completed.
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <AlertCircle className="h-16 w-16 text-red-600" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Workflow Error</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" onClick={handleRetry}>Try Again</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};