"""
Metaflow Bridge - Python Helper for VS Code Extension

This script acts as a JSON-based interface between the VS Code extension's Node.js runtime
and the Metaflow Python client. It allows the IDE to query local Metaflow metadata
dynamically without requiring a full metadata service.

Author: Shashank Reddy (GSOC Contributor)
Copyright: (c) 2026 - Metaflow Project
"""

import sys
import json
import argparse
from typing import List, Dict, Any

try:
    from metaflow import Metaflow, Flow, Run, Step
except ImportError:
    print(json.dumps({"error": "Metaflow library not found in Python path."}))
    sys.exit(1)

def list_flows() -> List[Dict[str, Any]]:
    """Lists all flows recorded in the local Metaflow metadata provider."""
    try:
        return [{"id": flow.id, "label": flow.id, "type": "flow"} for flow in Metaflow()]
    except Exception as e:
        return [{"error": f"Could not list Metaflow flows: {str(e)}"}]

def list_runs(flow_id: str) -> List[Dict[str, Any]]:
    """Lists recent runs for a given flow ID with enhanced metadata."""
    try:
        flow = Flow(flow_id)
        runs_data = []
        for run in flow.runs():
            # Get basic run metadata
            status = "Success" if run.successful else "Running" if run.finished is False else "Failed"
            user = run.data.get('user', 'unknown') if hasattr(run, 'data') else 'unknown'
            
            runs_data.append({
                "id": run.pathspec,
                "label": f"Run {run.id}",
                "type": "run",
                "status": status,
                "description": f"{status} • {run.created_at[:16]} • {user}",
                "tags": list(run.tags)
            })
        return runs_data
    except Exception as e:
        return [{"error": f"Failed to list runs for '{flow_id}': {str(e)}"}]

def list_steps(run_pathspec: str) -> List[Dict[str, Any]]:
    """Lists all steps for a specific execution run."""
    try:
        run = Run(run_pathspec)
        return [
            {"id": step.pathspec, "label": step.id, "type": "step"} 
            for step in run.steps()
        ]
    except Exception as e:
        return [{"error": f"Failed to list steps for '{run_pathspec}': {str(e)}"}]

def list_artifacts(step_pathspec: str) -> List[Dict[str, Any]]:
    """Lists all artifacts captured in a given flow step."""
    try:
        step = Step(step_pathspec)
        # Using task.artifacts to retrieve all logged artifacts in the task context
        return [
            {
                "id": art.pathspec, 
                "label": f"{art.id}: {type(art.data).__name__}", 
                "type": "artifact"
            } 
            for art in step.task.artifacts
        ]
    except Exception as e:
        return [{"error": f"Failed to list artifacts for '{step_pathspec}': {str(e)}"}]

def get_artifact_data(artifact_pathspec: str) -> Dict[str, Any]:
    """Retrieves the actual data value for a given artifact pathspec."""
    try:
        from metaflow import DataArtifact
        artifact = DataArtifact(artifact_pathspec)
        data = artifact.data
        
        # Determine how to represent the data string-wise
        if isinstance(data, (dict, list, int, float, bool, str)) or data is None:
            # We can try to keep it as is if it's already JSON-serializable, 
            # but for the preview we mostly want a nice string representation.
            value_str = json.dumps(data, indent=2) if not isinstance(data, str) else data
        else:
            # For complex objects like DataFrames, Models, etc.
            value_str = str(data)

        return {
            "id": artifact.id,
            "pathspec": artifact_pathspec,
            "type": type(data).__name__,
            "data": value_str
        }
    except Exception as e:
        return {"error": str(e)}

def get_step_logs(step_pathspec: str) -> Dict[str, Any]:
    """Fetches combined logs for a specific step execution (first task)."""
    try:
        step = Step(step_pathspec)
        task = list(step.tasks())[0] # Get the first task
        
        return {
            "id": step.id,
            "stdout": task.stdout,
            "stderr": task.stderr
        }
    except Exception as e:
        return {"error": str(e)}

def get_flow_structure(flow_id: str) -> Dict[str, Any]:
    """Retrieves the step-to-step graph structure of a Flow."""
    try:
        from metaflow import Flow
        flow = Flow(flow_id)
        # Metaflow's internal graph can be accessed via _graph
        graph = flow._graph
        
        nodes = []
        edges = []
        
        for step_name, node in graph.nodes.items():
            nodes.append({"id": step_name, "type": node.type})
            # Add connections to next steps
            for next_step in node.out_funcs:
                edges.append({"source": step_name, "target": next_step})
                
        return {
            "flow_id": flow_id,
            "nodes": nodes,
            "edges": edges
        }
    except Exception as e:
        return {"error": str(e)}

def main():
    """Main CLI execution handler."""
    parser = argparse.ArgumentParser(description="Metaflow VS Code Bridge")
    parser.add_argument("command", choices=["list_flows", "list_runs", "list_steps", "list_artifacts", "get_artifact_data", "get_step_logs", "get_flow_structure"])
    parser.add_argument("arg", nargs="?", help="Argument (FlowID, Pathspec, etc.)")
    
    args = parser.parse_args()
    
    try:
        if args.command == "list_flows":
            data = list_flows()
        elif args.command == "list_runs":
            data = list_runs(args.arg)
        elif args.command == "list_steps":
            data = list_steps(args.arg)
        elif args.command == "list_artifacts":
            data = list_artifacts(args.arg)
        elif args.command == "get_artifact_data":
            data = get_artifact_data(args.arg)
        elif args.command == "get_step_logs":
            data = get_step_logs(args.arg)
        elif args.command == "get_flow_structure":
            data = get_flow_structure(args.arg)
        
        # Ensure we always output valid JSON
        sys.stdout.write(json.dumps(data))
        sys.stdout.flush()
    except Exception as e:
        sys.stdout.write(json.dumps({"error": str(e)}))
        sys.stderr.write(f"Critical Bridge Error: {e}\n")

if __name__ == "__main__":
    main()
