// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {exec} from 'child_process';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	//console.log('Congratulations, your extension "ylint" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	//let disposable = vscode.commands.registerCommand('ylint.oclintCheck', () => {
		// The code you place here will be executed every time your command is executed
		
		// Display a message box to the user
		//vscode.window.showInformationMessage('Simple message from ylint!');
	//});

	//context.subscriptions.push(disposable);

	//TODO 
	vscode.window.showInformationMessage('Run command on save enabled.');


	//const folderPath = vscode.workspace.workspaceFolders[0].uri.toString().split(":")[1]

	var cmd = vscode.commands.registerCommand('ylint.executeOnSave', () => {
	
		var onSave = vscode.workspace.onDidSaveTextDocument((e: vscode.TextDocument) => {
			// execute some child process on save
			var child = require('child_process').exec('oclint-json-compilation-database -p . -- -max-priority-3=100 --rule=VariableNamingCheck -extra-arg=-Wno-error -extra-arg=-I/usr/lib/clang/9.0.0/include ' + e.fileName);
			
			child.stdout.on('data', (data: any) => {
				vscode.window.showInformationMessage(data);
				console.log('stdout:', data);
			});
		});
		context.subscriptions.push(onSave);
	});
		
	context.subscriptions.push(cmd);

}

// this method is called when your extension is deactivated
export function deactivate() {}
