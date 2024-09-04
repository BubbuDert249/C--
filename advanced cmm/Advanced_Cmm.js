const { exec } = require('child_process');
const os = require('os');

// Function to handle commands
function handleCommand(command) {
    try {
        if (command.startsWith('.runScript')) {
            let parts = command.split('%');
            if (parts.length !== 2 || !parts[1].includes('(') || !parts[1].includes(')')) {
                console.log("Invalid format. Use: .runScript%TYPE(<COMMAND>)");
                return;
            }

            // Extract script type and command
            let scriptType = parts[1].split('(')[0];
            let scriptCmd = parts[1].slice(parts[1].indexOf('(') + 1, -1); // Extract command within parentheses

            if (!scriptCmd) {
                console.log("No command provided. Please enter a valid command inside parentheses.");
                return;
            }

            switch (scriptType.toUpperCase()) {
                case 'BATCH':
                    console.log(`Executing Batch command: ${scriptCmd}`);
                    exec(scriptCmd, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Error executing Batch command: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            console.error(`Batch command stderr: ${stderr}`);
                        }
                        console.log(`Batch command output:\n${stdout}`);
                    });
                    break;

                case 'NODE':
                    console.log(`Executing Node.js command: ${scriptCmd}`);
                    try {
                        let result = eval(scriptCmd); // Executing Node.js code
                        console.log(`Node.js command result: ${result}`);
                    } catch (error) {
                        console.error(`Error executing Node.js command: ${error.message}`);
                    }
                    break;

                case 'POWERSHELL':
                    if (os.platform() === 'win32') {
                        console.log(`Executing PowerShell command: ${scriptCmd}`);
                        exec(`powershell -Command "${scriptCmd}"`, (error, stdout, stderr) => {
                            if (error) {
                                console.error(`Error executing PowerShell command: ${error.message}`);
                                return;
                            }
                            if (stderr) {
                                console.error(`PowerShell command stderr: ${stderr}`);
                            }
                            console.log(`PowerShell command output:\n${stdout}`);
                        });
                    } else {
                        console.log("PowerShell commands are only supported on Windows.");
                    }
                    break;

                default:
                    console.log("Unsupported script type. Use BATCH, NODE, or POWERSHELL.");
            }
        } else if (command === 'help') {
            // Display help with proper formatting
            console.log("Commands:");
            console.log(".runScript%BATCH(<batchcmd>)");
            console.log(".runScript%NODE(<nodejscmd>)");
            console.log(".runScript%POWERSHELL(<powershellcmd>)");
            console.log("help");
            console.log("cmmAdvanced");
            console.log("github");
            console.log("osInfo");
        } else if (command === 'cmmAdvanced') {
            console.log("C-- Advanced Version");
        } else if (command === 'github') {
            console.log("Opening GitHub...");
            // Open GitHub based on the platform
            if (os.platform() === 'win32') {
                exec('start "" "https://github.com"', (error) => {
                    if (error) {
                        console.error(`Error opening GitHub: ${error.message}`);
                    }
                });
            } else if (os.platform() === 'darwin') {
                exec('open "https://github.com"', (error) => {
                    if (error) {
                        console.error(`Error opening GitHub: ${error.message}`);
                    }
                });
            } else if (os.platform() === 'linux') {
                exec('xdg-open "https://github.com"', (error) => {
                    if (error) {
                        console.error(`Error opening GitHub: ${error.message}`);
                    }
                });
            } else {
                console.log("Unsupported platform for opening GitHub.");
            }
        } else if (command === 'osInfo') {
            // Display OS Information using os module
            console.log("OS Information:");
            console.log(`- Platform: ${os.platform()}`);
            console.log(`- Architecture: ${os.arch()}`);
            console.log(`- CPU: ${os.cpus()[0].model}`);
            console.log(`- Number of CPUs: ${os.cpus().length}`);
            console.log(`- Free memory: ${Math.round(os.freemem() / 1024 / 1024)} MB`);
            console.log(`- Total memory: ${Math.round(os.totalmem() / 1024 / 1024)} MB`);
        } else {
            console.log("Unknown command. Type 'help' for the list of available commands.");
        }
    } catch (error) {
        console.error(`An unexpected error occurred: ${error.message}`);
    }
}

// Capture command from command line input
const inputCommand = process.argv.slice(2).join(' '); 
handleCommand(inputCommand);
