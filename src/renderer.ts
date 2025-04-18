import './index.css';
import Editor from './Editor';
import GapBuffer from './collections/GapBuffer';
import FileData from './types/fileData';

const main = () => {
    const title = document.querySelector('title') as HTMLTitleElement;
    const text = document.getElementById('text-input') as HTMLTextAreaElement;
    const output = document.getElementById('output') as HTMLDivElement;
    const lineNumbers = document.getElementById('line-numbers') as HTMLTextAreaElement;

    const statTrackers = {
        ln: document.getElementById('ln') as HTMLSpanElement,
        col: document.getElementById('col') as HTMLSpanElement,
        char: document.getElementById('char') as HTMLSpanElement,
        totalLn: document.getElementById('totalLn') as HTMLSpanElement
    }

    const gapBuffer: GapBuffer = new GapBuffer("");
    const editor: Editor = new Editor(text, lineNumbers, statTrackers);
    editor.setLineNumbers();
    
    text.addEventListener('input', () => {
        editor.handleLineNumber(text);
        editor.getStats();
    });

    text.addEventListener('keydown', (e) => {
        e.preventDefault();
        editor.handleUndo(e, text);
        editor.handleTab(e, text, output);
        const cursorPos = gapBuffer.getCursorPos();

        if(e.key === "Enter"){
            gapBuffer.insert('\n', cursorPos);
            updateTextContent(text, editor, output, gapBuffer);
            gapBuffer.setCursorPos(cursorPos + 1);
            return;
        }

        if(e.key === "Backspace"){
            gapBuffer.delete(cursorPos);
            updateTextContent(text, editor, output, gapBuffer);
            return;
        }

        if(e.key.length === 1){
            gapBuffer.insert(e.key, cursorPos);
            updateTextContent(text, editor, output, gapBuffer);
            gapBuffer.setCursorPos(cursorPos + 1);
        }
    });

    text.addEventListener('click', () => {
        editor.getStats();
    });
    
    text.addEventListener('scroll', () => {
        editor.syncScroll(output);
    });
    
    window.electron.receiveFileData((e: Event, fileData: FileData) => {
        text.value = fileData.content; 
        editor.filePath = fileData.path;
        editor.setLineNumbers();
        editor.getStats();
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

const updateTextContent = (textArea: HTMLTextAreaElement, editor: Editor, output: HTMLDivElement, gapBuffer: GapBuffer): void => {
    textArea.value = gapBuffer.toString();
    editor.highlight(textArea, output);
}

main();