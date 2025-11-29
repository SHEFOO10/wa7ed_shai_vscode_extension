import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';

let shaiInterval: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('Shai Reminder is active!');

    // ====== Read user settings ======
    const getConfig = () => vscode.workspace.getConfiguration("shaiReminder");

    // Get sound path (custom or default)
    const getSoundFile = () => {
        const cfg = getConfig();
        const custom = cfg.get<string>("customSoundPath");

        if (custom && custom.trim() !== "")
            {return custom;}

        return path.join(context.extensionPath, "assets", "wa7ed_shai.wav");
    };

    // ====== Play Sound Function ======
    const playShaiSound = () => {
        const sound = getSoundFile();
        const platform = process.platform;

        const quote = (p: string) => {
            if (platform === "win32") {return p.replace(/'/g, "''");}
            return `"${p.replace(/"/g, '\\"')}"`;
        };
        const qp = quote(sound);

        if (platform === "win32") {
            const cmd = `powershell -NoProfile -Command "& { (New-Object System.Media.SoundPlayer '${qp}').PlaySync() }"`;
            exec(cmd);
            return;
        }

        const cmds = platform === "darwin"
            ? [`afplay ${qp}`]
            : [
                `paplay ${qp}`,
                `aplay ${qp}`,
                `play ${qp}`,
                `ffplay -nodisp -autoexit ${qp}`
            ];

        const tryPlay = (i: number) => {
            if (i >= cmds.length) {return;}
            exec(cmds[i], err => {
                if (err) {tryPlay(i + 1);}
            });
        };

        tryPlay(0);
    };

    // ====== Timer Function ======
    const startTimer = () => {
        const cfg = getConfig();
        const minutes = cfg.get<number>("intervalMinutes") ?? 30;
        const showMsg = cfg.get<boolean>("showNotifications");

        if (shaiInterval) {clearInterval(shaiInterval);}

        shaiInterval = setInterval(() => {
            if (showMsg)
                {vscode.window.showInformationMessage(" قوم اعملك كوبايه شاي ☕");}

            playShaiSound();
        }, minutes * 60 * 1000);
    };

    startTimer();

    // Restart timer on settings change
    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration("shaiReminder"))
            {startTimer();}
    });

    // ====== Commands ======
    const playNowCmd = vscode.commands.registerCommand("shai-reminder.playNow", () => {
        vscode.window.showInformationMessage("يكلاني واحد شاي ☕");
        playShaiSound();
    });

    // Set interval command
    const intervalCmd = vscode.commands.registerCommand("shai-reminder.setInterval", async () => {
        const current = getConfig().get<number>("intervalMinutes") ?? 30;
        const input = await vscode.window.showInputBox({
            prompt: "Enter reminder interval in minutes",
            value: current.toString(),
            validateInput: (value) => {
                const num = parseInt(value);
                if (isNaN(num) || num < 30 || num > (4 * 60)) {
                    return "معاك من 30 دقيقة لحد 240 دقيقة (4 ساعات)";
                }
                return null;
            }
        });

        if (input) {
            const minutes = parseInt(input);
            await getConfig().update("intervalMinutes", minutes, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(` كل ${minutes} دقيقة هيفكرك تشرب شاي ☕`);
        }
    });

     const settingsCmd = vscode.commands.registerCommand("shai-reminder.openSettings", async () => {
        await vscode.commands.executeCommand('workbench.action.openSettings', '@ext:SherifHamdy.wa7ed-shai');
    });

    // Choose custom sound command
    const customSoundCmd = vscode.commands.registerCommand("shai-reminder.chooseCustomSound", async () => {
        const uri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            openLabel: "Choose Custom Sound",
            filters: {
                "Audio Files": ["wav", "mp3"]
            }
        });

        if (uri && uri[0]) {
            const cfg = getConfig();
            cfg.update("customSoundPath", uri[0].fsPath, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(" اسمع الصوت جديد هيفكرك دلوقتي");
            playShaiSound();
        }
    });

    // ====== Status Bar Button ======
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "☕ شاي";
    statusBarItem.tooltip = "Play Shai Reminder Now";
    statusBarItem.command = "shai-reminder.playNow";
    statusBarItem.show();

    context.subscriptions.push(playNowCmd, intervalCmd, settingsCmd, customSoundCmd, statusBarItem);
}

// Cleanup
export function deactivate() {
    if (shaiInterval) {clearInterval(shaiInterval);}
}
