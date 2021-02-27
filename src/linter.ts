/**
* @file linter.ts
* @brief Manage lint operations
* @author magossou
* @version 1.0.0
* @date 2021-02-27
*/

import * as execa from "execa";
import * as fs from "fs";
import { listeners } from "process";
import {
  Diagnostic,
  DiagnosticCollection,
  DiagnosticSeverity,
  languages,
  TextDocument,
  workspace,
  Range,
  Position,
  window
} from "vscode";

const REGEX = /.+?:(\d+):(\d+):(\W+)(.+)\[(.+)\](.+)/g;

/**
* @brief Class for linter
*/
export default class Linter {
  private collection: DiagnosticCollection = languages.createDiagnosticCollection(
    "ylint"
  );
  private processes: WeakMap<
    TextDocument,
    execa.ExecaChildProcess
  > = new WeakMap();

  
  /**
  * @brief Stop/Dispose the current collection
  */
  public dispose() {
    this.collection.dispose();
  }

  
  /**
  * @brief Run the linter
  */
  public run(document: TextDocument) {
    if (document.languageId !== "c" && document.languageId !== "cpp") {
      return;
    }

    this.lint(document);
  }


  /**
  * @brief Clear the current collection
  * @param TextDocument: Current document
  */
  public clear(document: TextDocument) {
    if (document.uri.scheme === "file") {
      this.collection.delete(document.uri);
    }
  }

  
  /**
  * @brief Performs lint operation
  * @param TextDocument : Current document
  */
  private async lint(document: TextDocument) {
    let workSpace;

    const executablePath = workspace.getConfiguration("ylint")
      .executablePath;
    let configurationPath = workspace.getConfiguration("ylint")
    .configurationPath;

    if (configurationPath === ".ylint" && workspace.workspaceFolders) {
      configurationPath =
        workspace.workspaceFolders[0].uri.fsPath + "/" + configurationPath;
      workSpace = workspace.workspaceFolders[0].uri.fsPath + " ";
    }

    let command = executablePath + ' -p ' + workSpace + ' -i ' + document.fileName + ' ';

    if (fs.existsSync(configurationPath)) {
      fs.readFileSync(configurationPath, 'utf-8').split(/\r?\n/).forEach(function(line) {
        command = command + line + ' ';
      })
    } else {
      window.showWarningMessage(`${configurationPath} path does not exist! ylint extension using default settings`)
    }

    let child = require('child_process').exec(command);
    child.stdout.on('data', (data: any) => {

      let diagnostics = this.parse(data, document);
      if (diagnostics.length > 0) {
        this.collection.set(document.uri, diagnostics);
      } else
      {
        window.showWarningMessage(data);
      }
    });
  }


  /**
  * @brief Parse the output of lint operation
  * @param string : Lint log message
  * @param TextDocument : Current document
  */
  private parse(output: string, document: TextDocument): Diagnostic[] {

    const diagnostics = [];

    let match = REGEX.exec(output);
    while (match !== null) {
      const severity = DiagnosticSeverity.Error;
      const line = Math.max(Number.parseInt(match[1], 10) - 1, 0);
      const ruleName = match[4] + match[5];
      const message = match[6];
      const lineText = document.lineAt(line);
      const lineTextRange = lineText.range;
      const range = new Range(
        new Position(
          lineTextRange.start.line,
          lineText.firstNonWhitespaceCharacterIndex
        ),
        lineTextRange.end
      );

      diagnostics.push(
        new Diagnostic(range, `${ruleName}: ${message}`, severity)
      );
      match = REGEX.exec(output);
    }

    return diagnostics;
  }
}
