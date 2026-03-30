import * as vscode from 'vscode';

export class ArtifactTreeProvider implements vscode.TreeDataProvider<MetaflowItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<MetaflowItem | undefined | void> = new vscode.EventEmitter<MetaflowItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<MetaflowItem | undefined | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: MetaflowItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: MetaflowItem): Thenable<MetaflowItem[]> {
        if (!element) {
            // Root elements: Runs
            return Promise.resolve([
                new MetaflowItem('HelloFlow (Run 1774457489)', 'Success', vscode.TreeItemCollapsibleState.Collapsed, 'run'),
                new MetaflowItem('PlaylistFlow (Run 1774457556)', 'Success', vscode.TreeItemCollapsibleState.Collapsed, 'run')
            ]);
        } else if (element.contextValue === 'run') {
            // Children of runs: steps
            return Promise.resolve([
                new MetaflowItem('start', 'Step', vscode.TreeItemCollapsibleState.Collapsed, 'step'),
                new MetaflowItem('hello', 'Step', vscode.TreeItemCollapsibleState.Collapsed, 'step'),
                new MetaflowItem('end', 'Step', vscode.TreeItemCollapsibleState.Collapsed, 'step')
            ]);
        } else if (element.contextValue === 'step') {
            // Children of steps: artifacts
            return Promise.resolve([
                new MetaflowItem('genre', 'Artifact (str)', vscode.TreeItemCollapsibleState.None, 'artifact', vscode.ThemeIcon.File),
                new MetaflowItem('movies', 'Artifact (list)', vscode.TreeItemCollapsibleState.None, 'artifact', vscode.ThemeIcon.File)
            ]);
        }
        return Promise.resolve([]);
    }
}

export class MetaflowItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        private readonly version: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue: string,
        public readonly icon?: vscode.ThemeIcon
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}-${this.version}`;
        this.description = this.version;
        if (icon) {
            this.iconPath = icon;
        } else if (contextValue === 'run') {
            this.iconPath = new vscode.ThemeIcon('play');
        } else if (contextValue === 'step') {
            this.iconPath = new vscode.ThemeIcon('symbol-event');
        }
    }
}
