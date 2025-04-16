import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import ProjectSelector from '../captable/ProjectSelector';
import TokenList from './TokenList';
import { Loader2 } from 'lucide-react';

interface TokenManagementProps {
  projectId?: string;
  section?: string;
}

const TokenManagement: React.FC<TokenManagementProps> = ({ 
  projectId: propProjectId,
  section 
}) => {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [projectName, setProjectName] = useState<string>("");

  // Use projectId from props or from URL params
  const currentProjectId = propProjectId || paramProjectId;
  
  // Fetch data when the project changes
  useEffect(() => {
    if (!currentProjectId) {
      fetchPrimaryProject();
    } else if (currentProjectId !== "undefined" && currentProjectId !== undefined) {
      fetchProjectDetails();
    } else {
      console.log("Invalid project ID, fetching primary project instead");
      fetchPrimaryProject();
    }
  }, [currentProjectId]);

  // Function to fetch the primary project and navigate to it
  const fetchPrimaryProject = async () => {
    try {
      setIsLoading(true);
      console.log("No project ID provided, fetching primary project...");
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 10000);
      });
      
      // Create data fetch promise
      const fetchPromise = async () => {
        const { data, error } = await supabase
          .from("projects")
          .select("id, name")
          .eq("is_primary", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        
        return { data, error };
      };

      // Race the promises
      const { data, error } = await Promise.race([
        fetchPromise(),
        timeoutPromise.then(() => ({ data: null, error: { message: 'TimeoutError: signal timed out', code: '23' }}))
      ]) as { data: any, error: any };

      if (error) {
        console.error("Error fetching primary project:", error);
        // If no primary project found, fetch any project
        if (error.code === 'PGRST116' || error.code === '20' || error.code === '23') {
          // Create a second timeout promise for the fallback request
          const timeoutPromise2 = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timed out')), 10000);
          });
          
          // Create data fetch promise for any project
          const fetchAnyPromise = async () => {
            const { data, error } = await supabase
              .from("projects")
              .select("id, name")
              .order("created_at", { ascending: false })
              .limit(1)
              .single();
            
            return { data, error };
          };
          
          // Race the promises for the fallback
          const { data: anyProject, error: anyError } = await Promise.race([
            fetchAnyPromise(),
            timeoutPromise2.then(() => ({ data: null, error: { message: 'TimeoutError: signal timed out', code: '23' }}))
          ]) as { data: any, error: any };
          
          if (anyError) {
            console.error("Error fetching any project:", anyError);
            toast({
              title: "Error",
              description: "Failed to load projects. Please try again.",
              variant: "destructive",
            });
            return;
          }
          
          if (anyProject) {
            console.log("No primary project found, using first available project:", anyProject);
            // Navigate to the first available project
            navigate(`/token-management/${anyProject.id}`);
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to load primary project. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      if (data) {
        console.log("Found primary project:", data);
        // Navigate to the primary project
        navigate(`/token-management/${data.id}`);
      }
    } catch (err) {
      console.error("Error in fetchPrimaryProject:", err);
      toast({
        title: "Connection Error",
        description: "There was a problem connecting to the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch project details from Supabase
  const fetchProjectDetails = async () => {
    try {
      setIsLoading(true);
      
      // Validate project ID before making the request
      if (!currentProjectId || currentProjectId === "undefined") {
        console.log("Invalid project ID detected in fetchProjectDetails:", currentProjectId);
        toast({
          title: "Error",
          description: "Invalid project ID. Redirecting to primary project.",
          variant: "destructive",
        });
        fetchPrimaryProject();
        return;
      }
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 10000);
      });
      
      // Create data fetch promise
      const fetchPromise = async () => {
        const { data, error } = await supabase
          .from("projects")
          .select("name")
          .eq("id", currentProjectId)
          .single();
        
        return { data, error };
      };
      
      // Race the promises
      const { data, error } = await Promise.race([
        fetchPromise(),
        timeoutPromise.then(() => ({ data: null, error: { message: 'TimeoutError: signal timed out', code: '23' }}))
      ]) as { data: any, error: any };

      if (error) {
        console.error("Error fetching project details:", error);
        // If timeout or abort error, show appropriate message
        if (error.code === '20' || error.code === '23') {
          toast({
            title: "Connection Timeout",
            description: "The server took too long to respond. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to load project details. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      setProjectName(data?.name || "Project");
    } catch (err) {
      console.error("Error in fetchProjectDetails:", err);
      toast({
        title: "Error",
        description: "There was a problem loading project details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectChange = (newProjectId: string) => {
    navigate(`/token-management/${newProjectId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isLoading ? "Loading..." : projectName || "Token Management"}
        </h1>
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <ProjectSelector
            currentProjectId={currentProjectId}
            onProjectChange={handleProjectChange}
          />
        </div>
      </div>
      
      {currentProjectId && <TokenList projectId={currentProjectId} />}
    </div>
  );
};

export default TokenManagement; 