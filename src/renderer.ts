import './index.css';
import Editor from './editor';
import { State } from './types';

const main = () => {
    const text = document.getElementById('text-input') as HTMLTextAreaElement;
    const lineNumbers = document.getElementById('line-numbers') as HTMLTextAreaElement;

    const state: State = {
        textContent: "",
        lineNumber: 1,
        prevRowCount: text.value.split('\n').length
    }

    const editor: Editor = new Editor(text, lineNumbers);
    editor.setLineNumbers();

    text.addEventListener('input', (e) => {
        e.preventDefault();
        handleLineNumber(text, state, editor);
    });

    //Sync scroll
    text.addEventListener('scroll', () => {
        lineNumbers.scrollTop = text.scrollTop;
    });
}

const handleLineNumber = (text: HTMLTextAreaElement, state: { prevRowCount: number }, editor: Editor) => {
    const currentRowCount: number = text.value.split('\n').length;
    if(currentRowCount > state.prevRowCount){
        editor.addLineNumber();
    }
    if(currentRowCount < state.prevRowCount){
        editor.removeLineNumber(state.prevRowCount - currentRowCount);
    }
    state.prevRowCount = currentRowCount;
}

main();