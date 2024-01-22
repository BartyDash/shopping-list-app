import { initializeApp } from 'firebase/app';
import { getDatabase, push, ref } from 'firebase/database';

const firebaseSettings = {
    databaseURL: 'https://shopping-list-app-9a087-default-rtdb.europe-west1.firebasedatabase.app/'
};

const app = initializeApp(firebaseSettings);
const database = getDatabase(app);
const shoppingListDatabase = ref(database, 'shoppingList');

const inputField = document.querySelector('.input-field--js');
const addButton = document.querySelector('.add-button--js');

addButton.addEventListener('click', () => {
    let inputValue = inputField.value;

    push(shoppingListDatabase, inputValue);
    inputField.value = '';

    console.log(inputValue);
});