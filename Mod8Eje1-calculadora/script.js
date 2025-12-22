class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
        this.clear();
        this.updateHistory();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.isError = false; // Bandera para rastrear el estado de error
    }

    delete() {
        // Si estamos en estado de error, DELETE debe hacer un CLEAR
        if (this.isError || this.currentOperand === 'Syntax Error') {
            this.clear();
            return;
        }
        
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
    }

    appendNumber(number) {
        // Si hay un error, el siguiente número debe borrar el error e iniciar un nuevo cálculo
        if (this.isError || this.currentOperand === 'Syntax Error') {
            this.clear();
        }
        
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        // No se permite una operación si hay un error
        if (this.currentOperand === 'Syntax Error' || this.isError) return;
        
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                // Manejo de División por Cero
                if (current === 0) {
                    this.currentOperand = 'Syntax Error';
                    this.previousOperand = '';
                    this.operation = undefined;
                    this.isError = true;
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        // ===================================
        // LÓGICA DE DETECCIÓN DE ERRORES (Infinity, -Infinity, y NaN)
        // ===================================
        if (computation === Infinity || computation === -Infinity || isNaN(computation)) {
            this.currentOperand = 'Syntax Error'; // Muestra el error
            this.previousOperand = '';
            this.operation = undefined;
            this.isError = true;
            return; 
        }
        
        // Guardar en historial solo si no hay error
        const historyEntry = `${this.previousOperand} ${this.operation} ${this.currentOperand} = ${computation}`;
        this.history.unshift(historyEntry);
        if (this.history.length > 10) this.history.pop();
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        this.updateHistory();
        
        this.currentOperand = computation;
        this.operation = undefined;
        this.previousOperand = '';
        this.isError = false;
    }

    getDisplayNumber(number) {
        // Retorna el mensaje de error directamente sin intentar formatearlo
        if (number === 'Syntax Error') return number; 
        
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('es', {
                maximumFractionDigits: 0
            });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        // Si hay un error, el display actual ya tiene 'Syntax Error' (del compute)
        this.currentOperandElement.textContent = this.getDisplayNumber(this.currentOperand);
        
        // El display previo solo se actualiza si NO hay un error
        if (this.operation != null && !this.isError) {
            this.previousOperandElement.textContent =
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            // Limpia el display previo si hay un error o si el cálculo acaba de terminar
            this.previousOperandElement.textContent = '';
        }
    }

    updateHistory() {
        const historyList = document.querySelector('.history-list');
        if (!historyList) return; 
        
        historyList.innerHTML = '';
        
        this.history.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('history-item');
            div.textContent = item;
            historyList.appendChild(div);
        });
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('calculatorHistory');
        this.updateHistory();
    }
}

// Inicializar calculadora
const previousOperandElement = document.querySelector('.previous-operand');
const currentOperandElement = document.querySelector('.current-operand');
const calculator = new Calculator(previousOperandElement, currentOperandElement);

// Event listeners para botones numéricos
document.querySelectorAll('.btn-number').forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.textContent);
        calculator.updateDisplay();b    
    });
});

// Event listeners para botones de operación
document.querySelectorAll('.btn-operator').forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.textContent);
        calculator.updateDisplay();
    });
});

// Event listener para botón igual
document.querySelector('.btn-equals').addEventListener('click', () => {
    calculator.compute();
    calculator.updateDisplay();
});

// Event listener para botón clear
document.querySelector('.btn-clear').addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay();
});

// Event listener para botón delete
document.querySelector('.btn-delete').addEventListener('click', () => {
    calculator.delete();
    calculator.updateDisplay();
});

// Event listener para limpiar historial
document.querySelector('.btn-clear-history').addEventListener('click', () => {
    calculator.clearHistory();
});

// Soporte para teclado
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }
    if (e.key === '.') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        const operation = e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key;
        calculator.chooseOperation(operation);
        calculator.updateDisplay();
    }
    if (e.key === 'Enter' || e.key === '=') {
        // Prevenir el comportamiento predeterminado (ej: submit de formulario)
        e.preventDefault(); 
        calculator.compute();
        calculator.updateDisplay();
    }
    if (e.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    }
    if (e.key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
    }
});