// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Linter from "./linter"; 

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	vscode.window.showInformationMessage('Ylint extension enabled.');

	const linter = new Linter();
	context.subscriptions.push(linter);

	const updateDiagnostics = (document: vscode.TextDocument) => {
		linter.run(document);
	};

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument(document => {
			linter.clear(document);
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument(updateDiagnostics)
	);
	
	context.subscriptions.push(
		vscode.workspace.onDidSaveTextDocument(updateDiagnostics)
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
