import * as execa from "execa";
import { commandSync } from "execa";
import * as fs from "fs";
import {
  Diagnostic,
  DiagnosticCollection,
  DiagnosticSeverity,
  languages,
  TextDocument,
  workspace,
  Range,
  Position
} from "vscode";

const REGEX = /.+?:(\d+) \[(W|E)] (\w+): (.+)/g;

export default class Linter {
  private collection: DiagnosticCollection = languages.createDiagnosticCollection(
    "ylint"
  );
  private processes: WeakMap<
    TextDocument,
    execa.ExecaChildProcess
  > = new WeakMap();

  /**
   * dispose
   */
  public dispose() {
    this.collection.dispose();
  }

  /**
   * run
   */
  public run(document: TextDocument) {
    if (document.languageId !== "c") {
      return;
    }

    this.lint(document);
  }

  /**
   * clear
   */
  public clear(document: TextDocument) {
    if (document.uri.scheme === "file") {
      this.collection.delete(document.uri);
    }
  }

  
  private async lint(document: TextDocument) {
    var workSpace;
    var command;

    const executablePath = workspace.getConfiguration("ylint")
      .executablePath;
    let configurationPath = workspace.getConfiguration("ylint")
    .configurationPath;

    if (configurationPath === ".ylint.yml" && workspace.workspaceFolders) {
      configurationPath =
        workspace.workspaceFolders[0].uri.fsPath + "/" + configurationPath;
      workSpace = workspace.workspaceFolders[0].uri.fsPath + " ";
    }
    if (fs.existsSync(configurationPath)) {
      //TODO
    } else {
      console.warn(`${configurationPath} path does not exist! ylint extension using default settings`)
      command = executablePath + ' -p ' + workSpace + '-- -max-priority-3=100 --rule=VariableNamingCheck -extra-arg=-Wno-error -extra-arg=-I/usr/lib/clang/9.0.1/include ' + document.fileName;
    }

    var child = require('child_process').exec(command);
    child.stdout.on('data', (data: any) => {
	    console.log(data);
      //this.collection.set(document.uri, this.parse('stdout', data));
	  });
  }

  private parse(output: string, document: TextDocument): Diagnostic[] {
    const diagnostics = [];

    let match = REGEX.exec(output);
    while (match !== null) {
      const severity =
        match[2] === "W"
          ? DiagnosticSeverity.Warning
          : DiagnosticSeverity.Error;
      const line = Math.max(Number.parseInt(match[1], 10) - 1, 0);
      const ruleName = match[3];
      const message = match[4];
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
