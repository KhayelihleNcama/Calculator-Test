const ERROR_MESSAGE = 'Error';

function getDisplay() {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.getElementById('display');
}

function formatResult(value) {
  if (!Number.isFinite(value)) {
    return ERROR_MESSAGE;
  }

  const rounded = Number(value.toFixed(12));
  return Object.is(rounded, -0) ? 0 : rounded;
}

function appendToDisplay(input) {
  const display = getDisplay();
  const value = String(input ?? '');

  if (display) {
    if (display.value === ERROR_MESSAGE) {
      display.value = '';
    }

    const current = display.value;
    const lastChar = current.slice(-1);

    if (value === '.' && (current === '' || /[+\-*/]$/.test(current))) {
      display.value = `${current}0.`;
      return;
    }

    if (value === '.' && /\d*\.\d*$/.test(current) === false && current !== '') {
      const lastNumber = current.split(/[+\-*/]/).pop();
      if (lastNumber && lastNumber.includes('.')) {
        return;
      }
    }

    if (/[+\-*/]$/.test(value) && /[+\-*/]$/.test(lastChar)) {
      display.value = current.slice(0, -1) + value;
      return;
    }

    display.value += value;
    return;
  }

  if (typeof globalThis !== 'undefined') {
    globalThis.__calculatorTestState = globalThis.__calculatorTestState || {};
    const current = globalThis.__calculatorTestState.display || '';

    if (value === '.' && (current === '' || /[+\-*/]$/.test(current))) {
      globalThis.__calculatorTestState.display = `${current}0.`;
      return;
    }

    if (/[+\-*/]$/.test(value) && /[+\-*/]$/.test(current.slice(-1))) {
      globalThis.__calculatorTestState.display = current.slice(0, -1) + value;
      return;
    }

    globalThis.__calculatorTestState.display = current + value;
  }
}

function clearDisplay() {
  const display = getDisplay();

  if (display) {
    display.value = '';
    return;
  }

  if (typeof globalThis !== 'undefined') {
    globalThis.__calculatorTestState = globalThis.__calculatorTestState || {};
    globalThis.__calculatorTestState.display = '';
  }
}

function deleteLastCharacter() {
  const display = getDisplay();

  if (display) {
    display.value = display.value.slice(0, -1);
    return;
  }

  if (typeof globalThis !== 'undefined') {
    globalThis.__calculatorTestState = globalThis.__calculatorTestState || {};
    globalThis.__calculatorTestState.display = (globalThis.__calculatorTestState.display || '').slice(0, -1);
  }
}

function calculate() {
  const display = getDisplay();
  const expression = (display ? display.value : (globalThis.__calculatorTestState?.display || '')).trim();

  if (!expression) {
    return;
  }

  try {
    const sanitizedExpression = expression.replace(/%/g, '/100');
    /* eslint-disable no-new-func */
    const result = Function(`"use strict"; return (${sanitizedExpression});`)();
    const formatted = formatResult(result);

    if (display) {
      display.value = formatted;
      return;
    }

    if (typeof globalThis !== 'undefined') {
      globalThis.__calculatorTestState = globalThis.__calculatorTestState || {};
      globalThis.__calculatorTestState.display = String(formatted);
    }
  } catch (error) {
    if (display) {
      display.value = ERROR_MESSAGE;
      return;
    }

    if (typeof globalThis !== 'undefined') {
      globalThis.__calculatorTestState = globalThis.__calculatorTestState || {};
      globalThis.__calculatorTestState.display = ERROR_MESSAGE;
    }
  }
}

const buttons = typeof document !== 'undefined' ? document.querySelectorAll('button[data-value]') : [];

if (typeof document !== 'undefined') {
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.dataset.value;

      if (value === 'clear') {
        clearDisplay();
      } else if (value === 'delete') {
        deleteLastCharacter();
      } else if (value === '=') {
        calculate();
      } else {
        appendToDisplay(value);
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    const { key } = event;

    if (/^[0-9.+\-*/%]$/.test(key)) {
      event.preventDefault();
      appendToDisplay(key);
    } else if (key === 'Enter' || key === '=') {
      event.preventDefault();
      calculate();
    } else if (key === 'Backspace') {
      event.preventDefault();
      deleteLastCharacter();
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
      event.preventDefault();
      clearDisplay();
    }
  });
}

if (typeof module !== 'undefined') {
  module.exports = {
    appendToDisplay,
    clearDisplay,
    deleteLastCharacter,
    calculate,
    formatResult,
    getDisplay,
  };
}

if (typeof window !== 'undefined') {
  window.Calculator = {
    appendToDisplay,
    clearDisplay,
    deleteLastCharacter,
    calculate,
    formatResult,
    getDisplay,
  };
}