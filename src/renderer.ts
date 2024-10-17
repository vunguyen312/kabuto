import './index.css';
import Editor from './editor';

const main = () => {
    const title = document.querySelector('title') as HTMLTitleElement;
    const text = document.getElementById('text-input') as HTMLTextAreaElement;
    const output = document.getElementById('output') as HTMLDivElement;
    const lineNumbers = document.getElementById('line-numbers') as HTMLTextAreaElement;
    
    const editor: Editor = new Editor(text, lineNumbers);
    editor.setLineNumbers();
    
    text.addEventListener('input', (e) => {
        editor.handleLineNumber(text);
        editor.highlight(text, output);
        editor.getCaretPosition(output);
    });

    text.addEventListener('keydown', (e) => {
        editor.handleUndo(e, text);
    });

    text.addEventListener('click', () => {
        editor.getCaretPosition(output);
    });
    
    text.addEventListener('scroll', () => {
        editor.syncScroll(output);
    });
    
    window.electron.receiveFileData((e: Event, fileData: FileData) => {
        text.value = fileData.content; 
        editor.filePath = fileData.path;
        editor.setLineNumbers();
        editor.highlight(text, output);
        title.textContent = `Simple Text Editor - ${editor.filePath}`;
    });

    window.electron.pingSaveData(() => {
        window.electron.saveFileData({ path: editor.filePath, content: text.value });
    });

    window.electron.pingSaveAsData(() => {
        window.electron.saveFileAsData({ path: editor.filePath, content: text.value });
    });
}

main();