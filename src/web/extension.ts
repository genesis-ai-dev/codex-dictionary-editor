import * as vscode from 'vscode';
import { Dictionary, DictionaryEntry } from '../types';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('codex-dictionary.openDictionaryEditor', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            // Check if the file is a .dictionary file
            if (document.fileName.endsWith('.dictionary')) {
                const panel = vscode.window.createWebviewPanel(
                    'dictionaryEditor',
                    'Dictionary Editor',
                    vscode.ViewColumn.One,
                    { enableScripts: true }
                );

                const dictionaryContent = document.getText();
                const tableData = convertToTabularData(dictionaryContent);
                panel.webview.html = getWebviewContent(tableData);
            } else {
                vscode.window.showErrorMessage('Not a .dictionary file');
            }
        }
    });

    context.subscriptions.push(disposable);
}

function convertToTabularData(dictionaryContent: string): Array<DictionaryEntry> | null {
    try {
        const jsonData: Dictionary = JSON.parse(dictionaryContent);
        // Transform the JSON data into a tabular format
        const tabularData: Array<DictionaryEntry> = jsonData.entries;
        // Return the tabular data
        // vscode.window.showInformationMessage('Successfully parsed .dictionary file', JSON.stringify(jsonData));
        return tabularData;
    } catch (e) {
        vscode.window.showErrorMessage('Error parsing .dictionary file: ' + e);
        return null;
    }
}

function getWebviewContent(tableData: Array<DictionaryEntry>) {
    // Convert tableData into HTML table rows
    // vscode.window.showInformationMessage('Successfully parsed .dictionary file', JSON.stringify(tableData[0]));
    const tableRows = tableData.map(entry => `
        <tr>
            <td>${entry.id}</td>
            <td>${entry.headForm}</td>
            <td>${entry.definition}</td>
            <td>${entry.translationEquivalents && entry.translationEquivalents.length > 0 && entry.translationEquivalents.join(', ') || null}</td>
        </tr>
    `).join('');

    // HTML content with script to handle and display tableData
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <style>
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
            </style>
        </head>
        <body>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Head Form</th>
                        <th>Definition</th>
                        <th>Translation Equivalents</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </body>
        </html>`;
}

export function deactivate() { }

