/**
* @file extension.ts
* @brief Plugin extension file
* @author magossou
* @version 1.0.0
* @date 2021-02-27
*/

import * as vscode from 'vscode';
import Linter from "./linter"; 

/**
* @brief This method is called when extension is activated
* @param vscode.ExtensionContext : Activation context
*/
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

/**
* @brief This method is called when extension is deactivated
*/
export function deactivate() {}
