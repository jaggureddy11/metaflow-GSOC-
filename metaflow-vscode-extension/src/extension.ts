import * as vscode from 'vscode';
import { ArtifactTreeProvider } from './artifactTreeProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Metaflow IDE extension is now active!');

    const artifactProvider = new ArtifactTreeProvider();
    vscode.window.registerTreeDataProvider('metaflow-runs', artifactProvider);

    let disposable = vscode.commands.registerCommand('metaflow.showDag', () => {
        vscode.window.showInformationMessage('Metaflow DAG functionality coming soon!');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
