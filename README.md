# Zector Editor


<p align="center">

<img src="https://img.shields.io/badge/Electron-Enabled-47848F?logo=electron&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue" />
<img src="https://img.shields.io/badge/License-MIT-yellow" />

</p>

<p align="center">
  <b> A lightweight, fast, and minimal desktop text editor built
  with Electron.js. </b>
</p>

<p align="center">"My Grandma once said... Walking the path of heaven, the man who will rule everything!"</p>


------------------------------------------------------------------------

## Table of Contents

-   [About The Project](#about-the-project)
-   [Features](#features)
-   [Tech Stack](#tech-stack)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Screenshots](#screenshots)
-   [Configuration](#configuration)
-   [Dependencies](#dependencies)
-   [Troubleshooting](#troubleshooting)
-   [Roadmap](#roadmap)
-   [Contributing](#contributing)
-   [License](#license)

------------------------------------------------------------------------

## About The Project

**Zector Editor** is a lightweight desktop text editor built with
**Electron.js** and **Node.js** for local use.

It provides essential file editing functionality within a clean,
responsive desktop interface.
The goal of Zector Editor is simplicity --- delivering core editing
capabilities without unnecessary complexity.

This project is ideal for:

-   Local development environments
-   Educational purposes
-   Quick note-taking
-   Minimalist workflows

------------------------------------------------------------------------

## Features

-   Create new text files
-   Open existing files
-   Edit and modify content
-   Save files locally
-   Desktop application powered by Electron
-   Lightweight and responsive interface
-   Cross-platform support

------------------------------------------------------------------------

## Tech Stack

-   Electron.js
-   Node.js
-   Native Node modules

------------------------------------------------------------------------

## Installation

### 1. Clone the Repository

```
git clone <repository-url>
cd zector-editor
```

### 2. Install Dependencies

```
npm install
```

------------------------------------------------------------------------

## Usage

Start the application in development mode:

``` 
npm start
```

If no start script is defined:

```
npx electron .
```

Once launched:

1.  Create or open a file
2.  Edit content in the editor
3.  Save changes locally

------------------------------------------------------------------------

## Screenshots

### File Editing View

![Editing View](demo/demo.png)

------------------------------------------------------------------------

## Configuration

Zector Editor is designed for local desktop use and requires minimal
configuration.

You can customize:

-   Application window settings inside `index.ts`
-   IPC communication inside `preload.ts`
-   UI logic inside `Renderer.ts`
-   Start scripts in `package.json`

------------------------------------------------------------------------

## Dependencies

All dependencies are listed in:

`package.json`

Install them using:

```
npm install
```

------------------------------------------------------------------------

## Troubleshooting

### Application Does Not Start

-   Ensure Node.js is installed: ```node -v```

-   Ensure Electron is installed locally: ```npm install```

-   Try running directly: ```npx electron .```

### File Saving Issues

-   Verify write permissions in the selected directory
-   Ensure the file path exists and is valid

------------------------------------------------------------------------

## Roadmap

-   [ ] Add keyboard shortcuts
-   [ ] Add dark/light theme toggle
-   [ ] Add auto-save functionality
-   [ ] Add search and replace
-   [ ] Add multi-tab support

------------------------------------------------------------------------

## Contributing

Contributions are welcome.

1.  Fork the repository
2.  Create a new branch
3.  Commit your changes
4.  Push to your branch
5.  Open a pull request

------------------------------------------------------------------------

## License

This project is licensed under the MIT License.
