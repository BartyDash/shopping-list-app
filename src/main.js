import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, push, ref, remove } from 'firebase/database';

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
    let itemsArray = Object.entries(snapshot.val());

    clearShoppingList();
    
    for (let item of itemsArray) {
        appendItemShoppingList(item);
    }
});

function clearInputField() {
    inputField.value = '';
}

function clearShoppingList() {
    shoppingList.innerHTML = '';
}

function appendItemShoppingList(item) {
    let itemId = item[0];
    let itemValue = item[1];

    let newItem = document.createElement('li');
    newItem.textContent = itemValue;
    newItem.classList = 'bg-amber-50 p-3.5 rounded-lg text-xl text-center shadow grow';

    newItem.addEventListener('click', () => {
        let exactLocationItemInDb = ref(database, `shoppingList/${itemId}`);
        remove(exactLocationItemInDb);
    });

    shoppingList.append(newItem);
}