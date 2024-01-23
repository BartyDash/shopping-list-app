import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, push, ref } from 'firebase/database';

const firebaseSettings = {
    databaseURL: 'https://shopping-list-app-9a087-default-rtdb.europe-west1.firebasedatabase.app/'
};

const app = initializeApp(firebaseSettings);
const database = getDatabase(app);
const shoppingListDatabase = ref(database, 'shoppingList');

const inputField = document.querySelector('.input-field--js');
const addButton = document.querySelector('.add-button--js');
const shoppingList = document.querySelector('.shopping-list--js');

addButton.addEventListener('click', () => {
    let inputValue = inputField.value;

    push(shoppingListDatabase, inputValue);

    clearInputField();
});

onValue(shoppingListDatabase, (snapshot) => {
    let itemsArray = Object.values(snapshot.val());

    clearShoppingList();
    
    for (let element of itemsArray) {
        appendItemShoppingList(element);
    }
});

function clearInputField() {
    inputField.value = '';
}

function clearShoppingList() {
    shoppingList.innerHTML = '';
}

function appendItemShoppingList(inputValue) {
    let item = `<li class="bg-stone-100 p-3.5 rounded-lg text-xl text-center shadow grow">${inputValue}</li>`;
    shoppingList.insertAdjacentHTML('beforeend', item);
}