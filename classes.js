class EventBase {
    target;
    parentIdentifiers = [];
    identifier;
    intend = 3;
    constructor(target)
    {
        if (!target) {
            return;
        }
        this.target = target;
        this.identifier = new IdentifierCache(target);
    }
    textContent()
    {
        return this.target ? this.target.textContent : '';
    }
    getTarget()
    {
        return this.target;
    }
    toString()
    {
        if (this.identifier.getId()) {
            return this.identifier.toString();
        }
        const getParentIdentifiers = (element) => {
            const parentIdentifier = new IdentifierCache(element.parentElement);
            this.parentIdentifiers.push(parentIdentifier);
            if (parentIdentifier.getId()) {
                return;
            }
            if (this.parentIdentifiers.length > 2) {
                return;
            }
            if (element.parentElement) {
                getParentIdentifiers(element.parentElement);
            }
        };
        getParentIdentifiers(this.target);
        let resultString = '';
        for (let i = this.parentIdentifiers.length - 1; i >= 0; i--) {
            resultString += `${this.parentIdentifiers[i].toString()} `;
        }
        resultString += this.identifier.toString();
        return resultString;
    }
}

class WaitEvent extends EventBase {
    constructor(target)
    {
        super(target);
    }
    toString()
    {
        return `$this->waitForPageLoad($page);`;
    }
}

class InputElement extends EventBase {
    result;
    constructor(target)
    {
        super(target);
        this.target.addEventListener('input', () => {this.result = this.target.value});
    }
    toString()
    {
        return `${' '.repeat(this.intend)}$this->findCssAndSetValue($page, ${super.toString()}, ${this.result});\n`;
    }
}

class TextElement extends EventBase {
    constructor(target)
    {
        super(target);
    }
    toString()
    {
        return `${' '.repeat(this.intend)}$this->findCssAndGetText($page, ${super.toString()});`;
    }
}

class PressElement extends EventBase {
    constructor(target)
    {
        super(target);
    }
    toString()
    {
        return `${' '.repeat(this.intend)}$this->findCssAndGetText($page, ${super.toString()});`;
    }
}

class FunctionDeclaration extends EventBase {
    name = '';
    constructor(target, name)
    {
        super(target);
        this.intend = 0;
        this.name = name;
    }
    setName(newName)
    {
        this.name = newName;
    }
    toString()
    {
        return `
        public function ${this.name}(): void
        {`;
    }
}

class FileWrapperElement  extends EventBase {
    functions = [];
    constructor(target)
    {
        super(target);
    }
}

class WrapperElement extends EventBase {
    events = [];
    constructor(target)
    {
        super(target);
    }
    addEvent(event)
    {
        this.events.push(event);
        this.displayPopup(event);
    }
    toString()
    {
        let result = '';
        this.events.forEach(event => {
            result += `${event.toString()}<br>`; 
        });
        return result;
    }
    displayPopup(eventBase)
    {
        const notification = document.createElement('dialog');
        notification.className = 'js-prevent-check';
        document.body.append(notification);
        // Find the position and try to put the element there
        const bounds = eventBase.getTarget()?.getBoundingClientRect();
        if (bounds) {
            notification.style.top = `${bounds.top}px`;
            notification.style.left = `${bounds.left}px`;
        } else {
            notification.style.top = '50%';
        }

        notification.style.zIndex = 1000000;
        notification.textContent = `Added event: ${eventBase.toString()}`;
        notification.show();
        setTimeout(() => {notification.close(); notification.remove();}, 2000);
    }
}

class InitElement extends EventBase {
    url;
    constructor(target, url)
    {
        super(target);
        this.url = url;
    }
    toString()
    {
        return `
        ${' '.repeat(this.intend)}$session = $this->getMinkSession();<br>
        ${' '.repeat(this.intend)}$session->visit($this->getVuFindUrl('${this.url}'));<br>
        ${' '.repeat(this.intend)}$page = $session->getPage();`;
    }
}

class IdentifierCache {
    classList;
    id;
    tag;
    constructor(element)
    {
        if (!element) {
            return;
        }
        this.classList = element.classList;
        this.id = element.getAttribute('id');
        this.tag = element.tagName.toLowerCase();
    }
    getId()
    {
        return this.id;
    }
    toString()
    {
        const newList = [];
        if (this.classList && this.classList.length) {
            this.classList.forEach(l => newList.push(`.${l}`));
        }
        const finalId = this.id ? `#${this.id}` : '';
        return `${this.tag}${finalId}${newList.join('')}`;
    }
}
