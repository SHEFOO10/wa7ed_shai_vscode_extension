import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';

// A variable to hold our timer
let shaiInterval: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "shai-reminder" is now active!');

    // Get the full path to the sound file
    const soundFilePath = path.join(context.extensionPath, 'assets', 'wa7ed_shai.wav');

    // Function to play the sound using PowerShell SoundPlayer
    const playShaiSound = () => {
        console.log("Playing '...واحد شاي'");
        
        // Escape single quotes in path for PowerShell
        const safePath = soundFilePath.replace(/'/g, "''");
        const psCmd = `powershell -NoProfile -Command "& { (New-Object System.Media.SoundPlayer '${safePath}').PlaySync() }"`;

        exec(psCmd, (execErr: any, stdout: string, stderr: string) => {
            if (execErr) {
                console.error('Error playing sound:', execErr, stderr);
                vscode.window.showErrorMessage('Failed to play shai sound. See console for details.');
            } else {
                console.log('Shai sound finished playing');
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
        vscode.window.showInformationMessage('قوم اعمل شاي يعم انت');
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