import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, push, ref, remove } from 'firebase/database';
import typeahead from 'typeahead-standalone';

const firebaseSettings = {
    databaseURL: 'https://shopping-list-app-9a087-default-rtdb.europe-west1.firebasedatabase.app/'
};

const app = initializeApp(firebaseSettings);
const database = getDatabase(app);
const shoppingListDatabase = ref(database, 'shoppingList');
const autocompleteItemsDatabase = ref(database, 'autocompleteItems');

const inputField = document.querySelector('.input-field--js');
const addButton = document.querySelector('.add-button--js');
const shoppingList = document.querySelector('.shopping-list--js');

const autocompleteItems = ['Czekolada', 'Chleb', 'Masło', 'Mango', 'Kiwi', 'Jakiś inny owoc'];

typeahead({
    input: inputField,
    source: {
        local: autocompleteItems,
    },
    highlight: true,
    hint: false,
    diacritics: true,
    classNames : {
        wrapper : 'bg-zinc-200 text-yellow-950 rounded-lg text-xl text-center w-full max-w-lg',
    },
    onSubmit: (e, selectedSuggestion) => {
        const query = e.target.value;
        console.log(query);
        pushToDatabase(query);
        clearInputField();
    }
});
console.log(autocompleteItems);

addButton.addEventListener('click', () => {
    pushToDatabase(inputField.value);

    clearInputField();
});

onValue(shoppingListDatabase, (snapshot) => {
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val());

        clearShoppingList();
        
        for (let item of itemsArray) {
            appendItemShoppingList(item);
        }
    } else {
        shoppingList.innerHTML = 'Co tak tu pusto?... zgłodniałem🤤';
    }
});

function clearInputField() {
    inputField.value = '';
}

function clearShoppingList() {
    shoppingList.innerHTML = '';
}

function pushToDatabase(inputValue) {
    const regex = /[a-zA-Z0-9]/;

    if (regex.test(inputValue)) {
        push(shoppingListDatabase, inputValue);
    }
}

function appendItemShoppingList(item) {
    let itemId = item[0];
    let itemValue = item[1];

    let newItem = document.createElement('li');
    newItem.textContent = itemValue;
    newItem.classList = 'bg-amber-50 text-yellow-950 p-3.5 rounded-lg text-xl text-center shadow grow hover:bg-amber-100';

    newItem.addEventListener('click', () => {
        let exactLocationItemInDb = ref(database, `shoppingList/${itemId}`);
        remove(exactLocationItemInDb);
    });

    shoppingList.append(newItem);
}