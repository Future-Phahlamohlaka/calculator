const buttons = document.querySelectorAll('.btn');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const param = button.getAttribute('parameter');
    if (param === '⌫') {
      backSpace();
    } else if (param === 'AC') {
      clearInput();
    } else if (param === '=') {
      parse();
    } else {
      buttonClicked(param);
    }
  });
});

const modeToggleElement = document.getElementById('mode-toggle');

if (modeToggle) modeToggleElement.addEventListener('click', () => {
  modeToggle();
})
