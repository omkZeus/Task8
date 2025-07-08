import { ExcelClone } from './ExcelClone.js';
import { ExcelUI } from './ExcelUI.js';
import { ClipboardManager } from './ClipboardManager.js';

function createRootContainer(parent = document.body) {
    const root = document.createElement('div');
    root.className = 'app';
    parent.appendChild(root);
    return root;
}


const root  = createRootContainer();

const ui = new ExcelUI(root, {
    loadData: loadSampleData,
    clearData: clearData
});

const elements = ui.getElements();
const excel = new ExcelClone(elements); // pass all UI refs
console.log(elements)

const clipboard = new ClipboardManager(excel, {
    copyBtn: elements.copyBtn,
    pasteBtn: elements.pasteBtn
});

function generateSampleData(count = 100000) {
    const firstNames = ["Raj", "Anita", "Vikram", "Pooja", "Aman", "Neha", "Kunal", "Divya", "Suresh", "Meena"];
    const lastNames = ["Solanki", "Sharma", "Verma", "Patel", "Mehta", "Desai", "Kapoor", "Singh", "Jain", "Gupta"];
    const data = [];

    for (let i = 1; i <= count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const age = Math.floor(Math.random() * 43) + 18;
        const salary = Math.floor(Math.random() * 900000) + 100000;

        data.push({ id: i, firstName, lastName, Age: age, Salary: salary });
    }
    return data;
}

function loadSampleData() {
    const data = generateSampleData();
    excel.loadData(data);
    console.log('Loaded 100,000 records');
}

function clearData() {
    excel.data.clear();
    excel.render();
}

