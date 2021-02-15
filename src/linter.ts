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
  Position
} from "vscode";

const REGEX = /.+?:(\d+):(\d+):(\W+)(.+)\[(.+)\](.+)/g;

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

    let command = executablePath + ' -p ' + workSpace + ' -- ' + document.fileName + ' ';

    if (fs.existsSync(configurationPath)) {
      fs.readFileSync(configurationPath, 'utf-8').split(/\r?\n/).forEach(function(line) {
        console.log(line);
        command = command + line + ' ';
      })
    } else {
      console.warn(`${configurationPath} path does not exist! ylint extension using default settings`)
    }

    let child = require('child_process').exec(command);
    child.stdout.on('data', (data: any) => {
      this.collection.set(document.uri, this.parse(data, document));
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
