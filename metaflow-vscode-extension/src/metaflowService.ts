import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface MetaflowObject {
    id: string;
    label: string;
    type: 'flow' | 'run' | 'step' | 'artifact';
    status?: string;
    description?: string;
}

/**
 * MetaflowService
 * 
 * Handles all interactions with the Metaflow Python client.
 * This service manages the execution of the Python bridge and 
 * provides strongly-typed access to Metaflow metadata.
 */
export class MetaflowService {
    private pythonInterpreter: string = 'python3';
    private bridgeScriptPath: string;

    constructor(extensionPath: string) {
        this.bridgeScriptPath = path.join(extensionPath, 'scripts', 'metaflow_bridge.py');
    }

    /**
     * Executes the Python bridge script with specified commands.
     */
    private async callBridge(command: string, arg?: string): Promise<any> {
        try {
            const { stdout, stderr } = await execAsync(
                `${this.pythonInterpreter} "${this.bridgeScriptPath}" ${command} ${arg || ''}`
            );
            
            if (stderr) {
                console.warn(`Metaflow Bridge Warning: ${stderr}`);
            }

            return JSON.parse(stdout);
        } catch (error) {
            console.error(`Failed to execute Metaflow Bridge: ${error}`);
            throw new Error(`Metaflow service unavailable: ${error}`);
        }
    }

    public async getFlows(): Promise<MetaflowObject[]> {
        return this.callBridge('list_flows');
    }

    public async getRuns(flowId: string): Promise<MetaflowObject[]> {
        return this.callBridge('list_runs', flowId);
    }

    public async getSteps(runPathspec: string): Promise<MetaflowObject[]> {
        return this.callBridge('list_steps', runPathspec);
    }

    public async getArtifacts(stepPathspec: string): Promise<MetaflowObject[]> {
        return this.callBridge('list_artifacts', stepPathspec);
    }

    public async getArtifactData(artifactPathspec: string): Promise<any> {
        return this.callBridge('get_artifact_data', artifactPathspec);
    }

    public async getStepLogs(stepPathspec: string): Promise<any> {
        return this.callBridge('get_step_logs', stepPathspec);
    }

    public async getFlowStructure(flowId: string): Promise<any> {
        return this.callBridge('get_flow_structure', flowId);
    }
}
