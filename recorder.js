const dialogTemplate = `
    <h2>Mink test result</h2>
    
`;

const optionTemplate = `
    <h2>Options:</h2>
    <ul>
        <li><b>What is the name for the function for this test:</b></li>
        <li><input class="js-function-name" type="text" placeholder="exampleFunctionName"></input></li>
        <li><b>Write any overrides for configs in this text area:</b></li>
        <li><textarea>Not yet implemented</textarea></li>
        <li><button type="button" class="js-add-assert">Add an assert for test</button></li>
        <li><button type="button" class="js-add-wait">Add a wait for page load event</button></li>
    <ul>
`;

let isCapturing = false;

let isMenuOpen = false;

let optionDialog;

function setInnerHtml(element, content)
{
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    element.replaceChildren(...tempDiv.childNodes);
}

const helpText = `<p>Addon for recording tests running! [F1] Open settings [F2] Show results [F3] Start/Stop recording events [F4] Open add event menu</p><div class="js-record-state"></div>`;

// Add a text box up to the screen to give instructions
const guidediv = document.createElement('div');
guidediv.style.position = 'sticky';
guidediv.style.width = '100%';
guidediv.style.height = '50px';
guidediv.style.display = 'flex';
guidediv.style.justifyContent = 'center';
guidediv.style.alignItems = 'center';
guidediv.style.flexFlow = 'column';
setInnerHtml(guidediv, helpText);
recordStateDiv = guidediv.querySelector('.js-record-state');
document.body.prepend(guidediv);
let functionWrapper = new WrapperElement(document.body);
let functionDeclaration = new FunctionDeclaration(undefined, '');

functionWrapper.addEvent(functionDeclaration);
// Set starting values for the function
functionWrapper.addEvent(new InitElement(undefined, '/MyResearch/Profile'));

document.addEventListener('click', (e) => {
    if (!e.target) {
        return;
    }
    getAnEventFromElement(e.target, true);
}, true);
function displayResults() {
    isMenuOpen = true;
    const resultDialog = document.createElement('dialog');
    resultDialog.className = 'js-prevent-check';
    document.body.appendChild(resultDialog);
    setInnerHtml(resultDialog, functionWrapper.toString());
    resultDialog.showModal();
    resultDialog.addEventListener('close', () => {
        isMenuOpen = false;
        resultDialog.remove();
    });
}
function getAnEventFromElement(element, allowParentCheck = false)
{
    if (!isCapturing)
    {
        return;
    }
    if (element.closest('.js-prevent-check')) {
        return;
    }
    switch (element.tagName.toLowerCase()) {
        case "input":
            functionWrapper.addEvent(new InputElement(element));
            return true;
        case "a":
        case "button":
            functionWrapper.addEvent(new PressElement(element));
            return true;
        default:
            if (allowParentCheck) {
                let currentParent = element.parentElement;
                let resultOfParent = getAnEventFromElement(currentParent);
                if (!resultOfParent) {
                    functionWrapper.addEvent(new TextElement(element));
                }
            }
            return false;
    }
}

function toggleRecording()
{
    isCapturing = !isCapturing;
    recordStateDiv.textContent = `Is the addon recording: ${isCapturing}`;
}

// Add keypress handler for f[n] buttons
document.addEventListener('keydown', (e) => {

    switch (e.key) {
        case "F1":
            e.preventDefault();
            openMenu();
            // Open menu.
            break;
        case "F2":
            e.preventDefault();
            displayResults();
            // Show results shortcut
            break;
        case "F3":
            e.preventDefault();
            toggleRecording();
            break;
        case "F4":
            e.preventDefault();
            showEventMenu();
            break;
        default:
            break;
    }
});

function openMenu()
{
    if (isMenuOpen) {
        return;
    }
    isMenuOpen = true;
    const optionDialog = document.createElement('dialog');
    optionDialog.className = 'js-prevent-check';
    document.body.appendChild(optionDialog);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = optionTemplate;
    optionDialog.replaceChildren(...tempDiv.childNodes);
    optionDialog.querySelector('.js-function-name').addEventListener('input', (e) => {functionDeclaration.setName(e.target.value)});
    optionDialog.querySelector('.js-add-wait').addEventListener('click', (e) => {
        functionWrapper.addEvent(new WaitEvent());
        optionDialog.close();
    });
    optionDialog.addEventListener('close', () => {
        isMenuOpen = false;
        optionDialog.remove();
    });
    optionDialog.showModal();
}
