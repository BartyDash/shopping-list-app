const inputField = document.querySelector('.input-field--js');
const addButton = document.querySelector('.add-button--js');

addButton.addEventListener('click', () => {
    let inputValue = inputField.value;
    alert('click!' + inputValue);
});