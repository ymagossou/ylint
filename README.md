# ylint README


## Features

Simple linter plugin for C/C++ languages using oclint


## Requirements

### Supported Static Analyzers

* [Oclint](https://oclint.org/)

This static code analyzer must be installed on your machine(s).

The extension should support any versions of the static code
analyzer.


## Extension Settings

The settings of extension are:

* `ylint.executablePath`: Path to oclint-json-compilation-database executable (default: /usr/local/oclint-json-compilation-database)
* `ylint.configurationPath`: Path to ylint configuration file (default: .ylint)

Configuration file is simple text file where options are given line by line following this convention:
`oclint-json-compilation-database [options] -- [oclint_args] [oclint_args] ...`

Example of .ylint file:

```
#Options for oclint-json-compilation-database must be placed here
-e build
-- #This is the separator 
#Option for oclint must be placed here
--max-priority-3=100
--rule=GotoStatement
--extra-arg=-Wno-error 
--extra-arg=-I/usr/lib/clang/9.0.1/include 
```

For more information about JSON compilation database see: [oclint-docs](https://oclint-docs.readthedocs.io/en/v0.6/usage/oclint-json-compilation-database.html)
 
see also [clang.llvm](https://clang.llvm.org/docs/JSONCompilationDatabase.html)

NOTE:
1. Compilation database file must be placed on the Workspace directory
2. To generate compilation database file you can use `bear` or `compiledb` or `compdb`

Example: `bear make` will generate json compilation database


## Releases

### 1.0.0

Initial release


## Project details

Both the source code and issue tracker are hosted at
[GitHub](https://github.com/ymagossou/ylint).

For support purposes, please visit the above URL and select
from the Issue and/or Pull Request areas.

## License

Licensed under the [MIT License](https://opensource.org/licenses/MIT).
