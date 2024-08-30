const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const https = require('https');
const http = require('http');
const os = require('os');
const util = require('util');
const url = require('url');
const { createWriteStream } = require('fs');
const { exec: execPromise } = require('child_process');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to execute shell commands
const execShellCommand = (cmd) => execPromise(cmd);

// Function to display content with a specific hex color
function txtContent(content, hexColor) {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    console.log(`\x1b[38;2;${r};${g};${b}m%s\x1b[0m`, content);
}

// Change current working directory
function gotoDir(directory) {
    try {
        process.chdir(directory);
        console.log(`Changed directory to: ${directory}`);
    } catch (err) {
        console.error(`Error changing directory: ${err.message}`);
    }
}

// Create a new directory
function createDir(name) {
    try {
        if (!fs.existsSync(name)) {
            fs.mkdirSync(name);
            console.log(`Directory '${name}' created.`);
        } else {
            console.log(`Directory '${name}' already exists.`);
        }
    } catch (err) {
        console.error(`Error creating directory: ${err.message}`);
    }
}

// Remove a directory
function removeDir(name) {
    try {
        if (fs.existsSync(name)) {
            fs.rmdirSync(name, { recursive: true });
            console.log(`Directory '${name}' removed.`);
        } else {
            console.log(`Directory '${name}' does not exist.`);
        }
    } catch (err) {
        console.error(`Error removing directory: ${err.message}`);
    }
}

// Create a new file
function createFile(name, format) {
    const filePath = `${name}.${format}`;
    try {
        fs.writeFileSync(filePath, ''); // Create an empty file
        console.log(`File '${filePath}' created.`);
    } catch (err) {
        console.error(`Error creating file: ${err.message}`);
    }
}

// Remove a file
function removeFile(name, format) {
    const filePath = `${name}.${format}`;
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`File '${filePath}' removed.`);
        } else {
            console.log(`File '${filePath}' does not exist.`);
        }
    } catch (err) {
        console.error(`Error removing file: ${err.message}`);
    }
}

// Execute a .cmm file containing C-- language commands
function executeCMMFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const lines = fileContent.split('\n');
            lines.forEach((line) => {
                parseAndExecute(line.trim());
            });
        } else {
            console.log(`File '${filePath}' does not exist.`);
        }
    } catch (err) {
        console.error(`Error executing file: ${err.message}`);
    }
}

// Download a file from a URL
function downloadFile(urlStr, dest) {
    const file = fs.createWriteStream(dest);
    const parsedUrl = new URL(urlStr);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    protocol.get(urlStr, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close(() => console.log(`Downloaded '${dest}'`));
        });
    }).on('error', (err) => {
        fs.unlink(dest, () => {});
        console.error(`Error downloading file: ${err.message}`);
    });
}

// Download HTML content from a URL
function downloadHtml(urlStr, dest) {
    const file = fs.createWriteStream(dest);
    const parsedUrl = new URL(urlStr);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    protocol.get(urlStr, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close(() => console.log(`Downloaded HTML to '${dest}'`));
        });
    }).on('error', (err) => {
        fs.unlink(dest, () => {});
        console.error(`Error downloading HTML: ${err.message}`);
    });
}

// Download a GitHub repository as a ZIP file
function downloadGitHubRepo(repoUrl) {
    const repoName = path.basename(new URL(repoUrl).pathname, '.git');
    const zipUrl = `${repoUrl}/archive/refs/heads/main.zip`;
    const dest = `${repoName}.zip`;
    downloadFile(zipUrl, dest);
}

// Download a specific release from GitHub
function downloadGitHubRelease(releaseUrl) {
    const dest = path.basename(new URL(releaseUrl).pathname);
    downloadFile(releaseUrl, dest);
}

// Open a URL in the default browser
function openUrl(urlStr) {
    exec(`start "" "${urlStr}"`);
}

// Main function to interpret and execute input
function parseAndExecute(input) {
    const txtContentRegex = /^txtContent\((.*)\s+hex=(#[0-9A-Fa-f]{6})\)$/;
    const gotoRegex = /^goto\((.*)\)$/;
    const createDirRegex = /^createDir\((.*)\)$/;
    const removeDirRegex = /^removeDir\((.*)\)$/;
    const createFileRegex = /^createFile\((.*)\),\((.*)\)$/;
    const removeFileRegex = /^removeFile\((.*)\),\((.*)\)$/;
    const executeFileRegex = /^execute\((.*\.cmm)\)$/;
    const helpRegex = /^!-help$/;
    const openUrlRegex = /^openUrl\((https?:\/\/[^\)]+)\)$/;
    const pcInfoRegex = /^pcInfo$/;
    const cmmInfoRegex = /^cmmInfo$/;
    const wifiDetailsRegex = /^wifiDetails$/;
    const tInstallUrlRegex = /^t\.install\.url\((https?:\/\/[^\)]+)\)$/;
    const tInstallHtmlRegex = /^t\.install\.html\((https?:\/\/[^\)]+)\)$/;
    const tCloudflareRegex = /^t\.cloudflare$/;
    const openAppRegex = /^openApp\(([^)]+)\)$/;
    const updateCmmRegex = /^updateCmm$/;
    const githubRepoRegex = /^github\.rep\((https:\/\/github\.com\/[^\)]+)\)$/;
    const githubReleaseRegex = /^github\.release\((https:\/\/github\.com\/[^\)]+)\)$/;
    const githubRegex = /^github$/;

    let match;

    if ((match = txtContentRegex.exec(input)) !== null) {
        txtContent(match[1], match[2]);
    } else if ((match = gotoRegex.exec(input)) !== null) {
        gotoDir(match[1]);
    } else if ((match = createDirRegex.exec(input)) !== null) {
        createDir(match[1]);
    } else if ((match = removeDirRegex.exec(input)) !== null) {
        removeDir(match[1]);
    } else if ((match = createFileRegex.exec(input)) !== null) {
        createFile(match[1], match[2]);
    } else if ((match = removeFileRegex.exec(input)) !== null) {
        removeFile(match[1], match[2]);
    } else if ((match = executeFileRegex.exec(input)) !== null) {
        executeCMMFile(match[1]);
    } else if ((match = helpRegex.exec(input)) !== null) {
        console.log("Available commands:");
        console.log("  txtContent(content, hex=#RRGGBB)");
        console.log("  goto(directory)");
        console.log("  createDir(name)");
        console.log("  removeDir(name)");
        console.log("  createFile(name, format)");
        console.log("  removeFile(name, format)");
        console.log("  execute(file.cmm)");
        console.log("  !-help");
        console.log("  openUrl(url)");
        console.log("  pcInfo");
        console.log("  cmmInfo");
        console.log("  wifiDetails");
        console.log("  t.install.url(url)");
        console.log("  t.install.html(url)");
        console.log("  t.cloudflare");
        console.log("  openApp(path)");
        console.log("  updateCmm");
        console.log("  github.rep(url)");
        console.log("  github.release(url)");
        console.log("  github");
    } else if ((match = openUrlRegex.exec(input)) !== null) {
        openUrl(match[1]);
    } else if ((match = pcInfoRegex.exec(input)) !== null) {
        execShellCommand('systeminfo')
            .then(({ stdout }) => console.log(stdout))
            .catch(err => console.error(`Error fetching PC info: ${err.message}`));
    } else if ((match = cmmInfoRegex.exec(input)) !== null) {
        console.log("C-- v2.0.9");
    } else if ((match = wifiDetailsRegex.exec(input)) !== null) {
        execShellCommand('ipconfig')
            .then(({ stdout }) => console.log(stdout))
            .catch(err => console.error(`Error fetching Wi-Fi details: ${err.message}`));
    } else if ((match = tInstallUrlRegex.exec(input)) !== null) {
        downloadFile(match[1], path.basename(match[1]));
    } else if ((match = tInstallHtmlRegex.exec(input)) !== null) {
        downloadHtml(match[1], 'downloaded.html');
    } else if ((match = tCloudflareRegex.exec(input)) !== null) {
        openUrl('https://cloudflare.com');
    } else if ((match = openAppRegex.exec(input)) !== null) {
        exec(`start "" "${match[1]}"`);
    } else if ((match = updateCmmRegex.exec(input)) !== null) {
        console.log("No updates found.");
    } else if ((match = githubRepoRegex.exec(input)) !== null) {
        downloadGitHubRepo(match[1]);
    } else if ((match = githubReleaseRegex.exec(input)) !== null) {
        downloadGitHubRelease(match[1]);
    } else if ((match = githubRegex.exec(input)) !== null) {
        openUrl('https://github.com');
    } else {
        console.log(`Unknown command: ${input}`);
    }
}

// Start the custom command prompt
function prompt() {
    rl.question('C--Prompt> ', (input) => {
        parseAndExecute(input);
        prompt();
    });
}

prompt();
