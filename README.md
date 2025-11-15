# wa7ed_shai_vscode_extension

This guide provides a complete step-by-step tutorial on how to build a VS Code extension that plays a "يكلاني واحد شاي" sound every 15 minutes.

## 🛠️ What You'll Need

1.  **Node.js & npm:** Make sure they are installed.
2.  **VS Code Extension Scaffolding:** Install Yeoman and the VS Code generator:
    ```bash
    npm install -g yo generator-code
    ```
3.  **Your Sound File:** The "يكلاني واحد شاي.mp3" (or .wav) file.

-----

## Step 1: Create Your Extension Project

1.  Open your terminal and run the scaffolding tool:

    ```bash
    yo code
    ```

2.  Follow the prompts:

      * **Choose:** `New Extension (TypeScript)`
      * **Name:** `shai-reminder` (or whatever you like)
      * **Identifier:** `shai-reminder`
      * **Description:** `Plays a sound every 15 minutes.`
      * **Enable package manager:** `No`
      * **Initialize Git repository:** `No`
      * **Bundle webpack:** `No`
      * **Package manager:** `npm`

3.  Once it's done, open the new `shai-reminder` folder in VS Code:

    ```bash
    cd shai-reminder
    code .
    ```

-----

## Step 2: Add Your Sound File

1.  Inside your `shai-reminder` project folder, create a new folder named `sounds`.
2.  Place your audio file inside it. Let's rename it to **`shai.mp3`** for simplicity.
3.  Your project structure should look like this:
    ```
    shai-reminder/
    ├── sounds/
    │   └── shai.mp3
    ├── src/
    │   └── extension.ts
    ├── package.json
    └── ...
    ```

-----

## Step 3: Install the `play-sound` Package

This is the package that will play your sound. Open the VS Code terminal (`Ctrl+` \`).

1.  Install the package:
    ```bash
    npm install play-sound
    ```
2.  Install the type definitions for it (since we are using TypeScript):
    ```bash
    npm install @types/play-sound --save-dev
    ```

-----

## Step 4: Write the Code

Open the file `src/extension.ts` and **replace its entire content** with the code below.

```typescript
import * as vscode from 'vscode';
import * as path from 'path';
import * as player from 'play-sound';

// A variable to hold our timer
let shaiInterval: NodeJS.Timeout | undefined;

// Create a sound player instance
const soundPlayer = player({});

export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "shai-reminder" is now active!');

    // Get the full path to the sound file
    const soundFilePath = path.join(context.extensionPath, 'sounds', 'shai.mp3');

    // Function to play the sound
    const playShaiSound = () => {
        console.log("Playing '...واحد شاي'");
        soundPlayer.play(soundFilePath, (err) => {
            if (err) {
                console.error("Error playing sound:", err);
                vscode.window.showErrorMessage('Failed to play shai sound. See console for details.');
            }
        });
    };

    // --- Create the 15-minute timer ---
    const fifteenMinutes = 15 * 60 * 1000;
    
    // Start the timer when the extension is activated
    shaiInterval = setInterval(() => {
        playShaiSound();
    }, fifteenMinutes);

    // --- Add a test command ---
    // This lets you test the sound without waiting 15 minutes
    let disposable = vscode.commands.registerCommand('shai-reminder.playNow', () => {
        vscode.window.showInformationMessage('...بقولك ايه');
        playShaiSound();
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
    // Clear the timer when the extension is closed
    if (shaiInterval) {
        clearInterval(shaiInterval);
    }
}
```

-----

## Step 5: Add the Test Command to `package.json`

To make our `shai-reminder.playNow` command visible in the Command Palette, open your `package.json` file.

Find the `"contributes"` section (it will be empty: `{}`) and replace it with this:

```json
  "contributes": {
    "commands": [
      {
        "command": "shai-reminder.playNow",
        "title": "Shai Reminder: Play Sound Now"
      }
    ]
  },
```

-----

## Step 6: Test Your Extension

You're all set\!

1.  Press **F5** in VS Code. This will open a new "[Extension Development Host]" window.
2.  Your extension is now running in this new window.
3.  To test it immediately, open the Command Palette (**Ctrl+Shift+P**).
4.  Type "Shai Reminder" and select **Shai Reminder: Play Sound Now**.
5.  You should hear "يكلاني واحد شاي"\!
6.  If you leave this window open, the sound will now play automatically every 15 minutes.

When you're done, just close the "[Extension Development Host]" window to stop testing.
