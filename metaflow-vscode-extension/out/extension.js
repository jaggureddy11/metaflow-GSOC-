"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
function activate(context) {
    console.log('Metaflow IDE extension is now active!');
    let disposable = vscode.commands.registerCommand('metaflow.showDag', () => {
        vscode.window.showInformationMessage('Metaflow DAG functionality coming soon!');
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map