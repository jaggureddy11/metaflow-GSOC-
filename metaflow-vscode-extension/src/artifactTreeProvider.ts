import * as vscode from 'vscode';
import { MetaflowService, MetaflowObject } from './metaflowService';

/**
 * ArtifactTreeProvider
 * 
 * Manages the "Past Runs & Artifacts" tree view in the Metaflow Explorer.
 * Connects the Metaflow objects (Flows, Runs, Steps, Artifacts) to VS Code's Tree UI.
 */
export class ArtifactTreeProvider implements vscode.TreeDataProvider<MetaflowItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<MetaflowItem | undefined | void> = new vscode.EventEmitter<MetaflowItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<MetaflowItem | undefined | void> = this._onDidChangeTreeData.event;

    private metaflowService: MetaflowService;

    constructor(metaflowService: MetaflowService) {
        this.metaflowService = metaflowService;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: MetaflowItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: MetaflowItem): Promise<MetaflowItem[]> {
        try {
            if (!element) {
                // Root: Flows
                const flows = await this.metaflowService.getFlows();
                if (flows.length > 0 && (flows[0] as any).error) {
                    return [new MetaflowItem('Error Connecting', (flows[0] as any).error, vscode.TreeItemCollapsibleState.None, 'error', undefined, new vscode.ThemeIcon('warning'))];
                }
                return flows.map(f => {
                    const item = new MetaflowItem(f.label, 'Flow', vscode.TreeItemCollapsibleState.Collapsed, 'flow', f.id);
                    item.command = {
                        command: 'metaflow.showDag',
                        title: 'Show DAG',
                        arguments: [f.id]
                    };
                    return item;
                });
            }

            switch (element.contextValue) {
                case 'flow':
                    const runs = await this.metaflowService.getRuns(element.id!);
                    if (runs.length > 0 && (runs[0] as any).error) {
                         return [new MetaflowItem('Error', (runs[0] as any).error, vscode.TreeItemCollapsibleState.None, 'error', undefined, new vscode.ThemeIcon('warning'))];
                    }
                    return runs.map(r => new MetaflowItem(r.label, r.description || r.status || '', vscode.TreeItemCollapsibleState.Collapsed, 'run', r.id));
                
                case 'run':
                    const steps = await this.metaflowService.getSteps(element.id!);
                    if (steps.length > 0 && (steps[0] as any).error) {
                        return [new MetaflowItem('Error', (steps[0] as any).error, vscode.TreeItemCollapsibleState.None, 'error', undefined, new vscode.ThemeIcon('warning'))];
                    }
                    return steps.map(s => {
                        const item = new MetaflowItem(s.label, 'Step', vscode.TreeItemCollapsibleState.Collapsed, 'step', s.id);
                        item.command = {
                            command: 'metaflow.viewLogs',
                            title: 'View Logs',
                            arguments: [s.id]
                        };
                        return item;
                    });
                
                case 'step':
                    const artifacts = await this.metaflowService.getArtifacts(element.id!);
                    if (artifacts.length > 0 && (artifacts[0] as any).error) {
                        return [new MetaflowItem('Error', (artifacts[0] as any).error, vscode.TreeItemCollapsibleState.None, 'error', undefined, new vscode.ThemeIcon('warning'))];
                    }
                    return artifacts.map(a => {
                        const item = new MetaflowItem(a.label, 'Artifact', vscode.TreeItemCollapsibleState.None, 'artifact', a.id, vscode.ThemeIcon.File);
                        item.command = {
                            command: 'metaflow.viewArtifact',
                            title: 'View Artifact',
                            arguments: [a.id]
                        };
                        return item;
                    });
                
                default:
                    return [];
            }
        } catch (err) {
            vscode.window.showErrorMessage(`Metaflow Explorer Error: ${err}`);
            return [];
        }
    }
}

/**
 * MetaflowItem
 * 
 * Represents a single node (leaf or branch) in the Metaflow Tree.
 */
export class MetaflowItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        private readonly descriptionText: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue: string,
        public readonly id?: string, // Using id as the pathspec consistently
        public readonly icon?: vscode.ThemeIcon
    ) {
        super(label, collapsibleState);
        this.description = descriptionText;
        this.tooltip = `${this.label} — ${this.descriptionText}`;

        // Dynamic Icon Handling
        if (icon) {
            this.iconPath = icon;
        } else {
            this.iconPath = this.getIconForType(contextValue);
        }
    }

    private getIconForType(type: string): vscode.ThemeIcon {
        switch (type) {
            case 'flow': return new vscode.ThemeIcon('symbol-namespace');
            case 'run': return new vscode.ThemeIcon('play-circle');
            case 'step': return new vscode.ThemeIcon('symbol-method');
            case 'artifact': return new vscode.ThemeIcon('symbol-field');
            default: return new vscode.ThemeIcon('circle-outline');
        }
    }
}
