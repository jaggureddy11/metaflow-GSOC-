import * as vscode from 'vscode';
import { ArtifactTreeProvider } from './artifactTreeProvider';
import { MetaflowService } from './metaflowService';

/**
 * Metaflow IDE Extension - Activate
 * 
 * Entry point for the extension's lifecycle.
 * Registers tree data providers and commands for the Metaflow explorer.
 */
export async function activate(context: vscode.ExtensionContext) {
    console.log('[Metaflow IDE] Extension activation sequence started.');

    const metaflowService = new MetaflowService(context.extensionPath);
    
    // Initialize the Tree Data Provider for Metaflow runs
    const artifactProvider = new ArtifactTreeProvider(metaflowService);
    
    // Create the Tree View and Register the Provider
    const metaflowTreeView = vscode.window.registerTreeDataProvider('metaflow-runs', artifactProvider);

    // Virtual Document Provider for viewing artifacts
    const artifactScheme = 'metaflow-artifact';
    const artifactProviderContent = new class implements vscode.TextDocumentContentProvider {
        async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
            try {
                const pathspec = uri.query;
                const result = await metaflowService.getArtifactData(pathspec);
                
                if (result.error) {
                    return `Error loading artifact: ${result.error}`;
                }

                return `Artifact: ${result.id}\n` +
                       `Pathspec: ${result.pathspec}\n` +
                       `Type: ${result.type}\n` +
                       `---------------------------------------\n\n` +
                       `${result.data}`;
            } catch (err) {
                return `Error: ${err}`;
            }
        }
    };

    // Virtual Document Provider for viewing logs
    const logScheme = 'metaflow-log';
    const logProviderContent = new class implements vscode.TextDocumentContentProvider {
        async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
            try {
                const pathspec = uri.query;
                const result = await metaflowService.getStepLogs(pathspec);
                
                if (result.error) {
                    return `Error loading logs: ${result.error}`;
                }

                let output = `Step Logs: ${result.id}\n`;
                output += `Pathspec: ${pathspec}\n`;
                output += `=======================================\n\n`;
                
                output += `--- STDOUT ---\n${result.stdout || '(no stdout)'}\n\n`;
                output += `--- STDERR ---\n${result.stderr || '(no stderr)'}\n`;
                
                return output;
            } catch (err) {
                return `Error: ${err}`;
            }
        }
    };

    // Register UI Commands
    const disposables = [
        metaflowTreeView,
        vscode.workspace.registerTextDocumentContentProvider(artifactScheme, artifactProviderContent),
        vscode.workspace.registerTextDocumentContentProvider(logScheme, logProviderContent),
        vscode.commands.registerCommand('metaflow.refreshRuns', () => artifactProvider.refresh()),
        vscode.commands.registerCommand('metaflow.viewArtifact', async (pathspec: string) => {
            const uri = vscode.Uri.parse(`${artifactScheme}:Artifact Data?${pathspec}`);
            const doc = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(doc, { preview: true });
        }),
        vscode.commands.registerCommand('metaflow.viewLogs', async (pathspec: string) => {
            const uri = vscode.Uri.parse(`${logScheme}:Step Logs?${pathspec}`);
            const doc = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(doc, { preview: true });
        }),
        vscode.commands.registerCommand('metaflow.showDag', async (flowId: string) => {
            const panel = vscode.window.createWebviewPanel(
                'metaflowDag',
                `DAG: ${flowId}`,
                vscode.ViewColumn.One,
                { enableScripts: true }
            );

            try {
                const structure = await metaflowService.getFlowStructure(flowId);
                if (structure.error) {
                    panel.webview.html = `<h1>Error</h1><p>${structure.error}</p>`;
                    return;
                }

                // Generate Mermaid.js graph definition
                let mermaidGraph = 'graph TD\n';
                structure.edges.forEach((edge: any) => {
                    mermaidGraph += `    ${edge.source} --> ${edge.target}\n`;
                });

                // Set node styles based on type
                structure.nodes.forEach((node: any) => {
                    if (node.type === 'start') {
                        mermaidGraph += `    style ${node.id} fill:#f9f,stroke:#333,stroke-width:4px\n`;
                    } else if (node.type === 'end') {
                        mermaidGraph += `    style ${node.id} fill:#9ff,stroke:#333,stroke-width:4px\n`;
                    }
                });

                panel.webview.html = getWebviewContent(flowId, mermaidGraph);
            } catch (err) {
                panel.webview.html = `<h1>Error</h1><p>${err}</p>`;
            }
        })
    ];

    context.subscriptions.push(...disposables);
    
    console.log('[Metaflow IDE] Activation complete.');
}

function getWebviewContent(flowId: string, mermaidGraph: string) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Metaflow DAG</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <style>
        :root {
            --bg: var(--vscode-editor-background);
            --fg: var(--vscode-editor-foreground);
            --title-fg: var(--vscode-editor-foreground);
            --border: var(--vscode-panel-border);
        }
        body { 
            background-color: var(--bg); 
            color: var(--fg);
            padding: 30px; 
            font-family: var(--vscode-font-family);
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .header {
            width: 100%;
            max-width: 1000px;
            border-bottom: 1px solid var(--border);
            margin-bottom: 30px;
            padding-bottom: 10px;
        }
        h1 { margin: 0; font-size: 1.5rem; color: var(--title-fg); }
        .subtitle { font-size: 0.9rem; opacity: 0.7; margin-top: 5px; }
        .mermaid { 
            background: white; 
            padding: 40px; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>DAG Visualization</h1>
        <div class="subtitle">Flow ID: <b>${flowId}</b></div>
    </div>
    <div class="mermaid">
        ${mermaidGraph}
    </div>
    <script>
        // Use a slight delay to ensure the container is ready
        setTimeout(() => {
            mermaid.initialize({ 
                startOnLoad: true, 
                theme: 'neutral',
                securityLevel: 'loose',
                flowchart: { useMaxWidth: true, htmlLabels: true }
            });
        }, 100);
    </script>
</body>
</html>`;
}

export function deactivate() {
    console.log('[Metaflow IDE] Deactivation sequence complete.');
}
