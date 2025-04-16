import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface ProjectSelectorProps {
  currentProjectId?: string;
  onProjectChange?: (projectId: string) => void;
}

const ProjectSelector = ({
  currentProjectId,
  onProjectChange,
}: ProjectSelectorProps) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >(currentProjectId);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProjectsWithTimeout = async () => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 10000);
      });
      
      try {
        const result = await Promise.race([
          fetchProjects(),
          timeoutPromise
        ]);
        return result;
      } catch (error) {
        console.error("Fetch projects timeout:", error);
        toast({
          title: "Connection Timeout",
          description: "The server took too long to respond. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    fetchProjectsWithTimeout();
  }, []);

  useEffect(() => {
    // Only update if the currentProjectId is valid
    if (currentProjectId && currentProjectId !== "undefined") {
      setSelectedProjectId(currentProjectId);
    }
  }, [currentProjectId]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      // Fetch all projects, but order by is_primary (so primary projects are first)
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, is_primary")
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProjects(data || []);

      // If no valid project is selected, prioritize primary project
      const isValidProjectId = selectedProjectId && selectedProjectId !== "undefined";
      if ((!isValidProjectId) && data && data.length > 0) {
        // Look for a primary project
        const primaryProject = data.find(project => project.is_primary === true);
        
        // If primary project exists, select it; otherwise, select the first project
        if (primaryProject) {
          console.log(`Found primary project: ${primaryProject.name} (${primaryProject.id})`);
          setSelectedProjectId(primaryProject.id);
          // If there's an onProjectChange callback, trigger it with the primary project
          if (onProjectChange) {
            onProjectChange(primaryProject.id);
          }
        } else if (data.length > 0) {
          console.log(`No primary project found, selecting first project: ${data[0].name} (${data[0].id})`);
          setSelectedProjectId(data[0].id);
          // If there's an onProjectChange callback, trigger it with the first project
          if (onProjectChange) {
            onProjectChange(data[0].id);
          }
        }
      }
      return data;
    } catch (err) {
      console.error("Error fetching projects:", err);
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    if (onProjectChange) {
      onProjectChange(projectId);
    }
  };

  const handleGoToProject = () => {
    if (selectedProjectId) {
      navigate(`/projects/${selectedProjectId}/captable`);
    }
  };

  const handleRefreshProjects = () => {
    fetchProjects();
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading projects...</span>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">No projects available</span>
        <Button size="sm" onClick={() => navigate("/projects")}>
          Create Project
        </Button>
        <Button size="sm" variant="outline" onClick={handleRefreshProjects}>
          <Loader2 className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedProjectId} onValueChange={handleProjectChange}>
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name} {project.is_primary && "(Primary)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!currentProjectId && selectedProjectId && (
        <Button onClick={handleGoToProject}>View Project</Button>
      )}
    </div>
  );
};

export default ProjectSelector;
