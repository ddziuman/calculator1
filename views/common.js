export function cursorAppendValue(inputElement, value) {
  inputElement.setRangeText(value, inputElement.selectionStart, inputElement.selectionEnd, 'end');
}

export function setCursorPosition(inputElement, position) {
  inputElement.focus();
  inputElement.setSelectionRange(position, position);
}