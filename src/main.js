import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, push, ref, remove } from 'firebase/database';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import typeahead from 'typeahead-standalone';

const firebaseSettings = {
    databaseURL: 'https://shopping-list-app-9a087-default-rtdb.europe-west1.firebasedatabase.app/'
};

const firebaseConfig = {
    apiKey: "AIzaSyDgJtVqeFX3rLoIk5OI1A7Hpt4gR6ES9d8",
    authDomain: "shopping-list-app-9a087.firebaseapp.com",
    databaseURL: "https://shopping-list-app-9a087-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "shopping-list-app-9a087",
    storageBucket: "shopping-list-app-9a087.appspot.com",
    messagingSenderId: "301697009995",
    appId: "1:301697009995:web:6341f92cc00fce57d140ce"
  };

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const shoppingListDatabase = ref(database, 'shoppingList');
const autocompleteItemsDatabase = ref(database, 'autocompleteItems');

const inputField = document.querySelector('.input-field--js');
const addButton = document.querySelector('.add-button--js');
const shoppingList = document.querySelector('.shopping-list--js');

const autocompleteItems = [];

const instance = typeahead({
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
        pushToDatabase(query);
        clearInputField();
        inputField.blur();
    }
});

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

onValue(autocompleteItemsDatabase, (snapshot) => {
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val());

        getAutocompleteItemsToArray(itemsArray);
    } else {
        console.log('snapshot not exist');
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
        push(shoppingListDatabase, changeFirstLetterUpperCase(inputValue));

        let isTheSame = autocompleteItems.some((element) => {
            return element.toLowerCase() === inputValue.toLowerCase();
        });

        if (isTheSame == false) {
            pushAutocompleteItemToDatabase(inputValue);
        }
    }
}

function appendItemShoppingList(item) {
    let itemId = item[0];
    let itemValue = item[1];

    let newItem = document.createElement('li');
    newItem.textContent = itemValue;
    newItem.classList = 'bg-yellow-soup-light text-brown-derby p-3.5 rounded-lg text-xl text-center shadow grow transition md:hover:scale-105 md:hover:bg-yellow-soup-dark active:scale-95 md:active:scale-95 active:bg-yellow-soup-dark';

    newItem.addEventListener('click', () => {
        let exactLocationItemInDb = ref(database, `shoppingList/${itemId}`);
        remove(exactLocationItemInDb);
    });

    shoppingList.append(newItem);
}

function getAutocompleteItemsToArray(itemsArray) {
    autocompleteItems.length = 0;
    for (let item of itemsArray) {
        autocompleteItems.push(item[1]);
    }
    // instance.reset(); <--- not working :( - array.length=0 working good instead
    
    instance.addToIndex(autocompleteItems);
}

function pushAutocompleteItemToDatabase(item) {
    push(autocompleteItemsDatabase, changeFirstLetterUpperCase(item));
}

function changeFirstLetterUpperCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//auth code functions below

const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');

// loginButton.addEventListener('click', login);
registerButton.addEventListener('click', register);

function register() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    //check input fields format
    if (isEmailCorrectFormat(email) == false || isPasswordCorrectFormat(password) == false) {
        alert('Twój email lub hasło są niepoprawne!');
        return;
    }

    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        //signed up
        const user = userCredential.user;
        //add user to database
        const databaseRef = ref(database, 'users');

        const userData = {
            email: email,
            lastLogin: Date.now()
        }

        // databaseRef.child('users/' + user.uid).set(userData);
        push(databaseRef, userData);

        alert('Zarejestrowano!');
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        alert(errorMessage + '\n' + errorCode);
    });
}

function isEmailCorrectFormat(email) {
    const regex = /^[^@]+@\w+(\.\w+)+\w$/;
    if (regex.test(email) == true) {
        //email is good :D
        return true;
    } else {
        //email isn't good :(
        return false;
    }
}

function isPasswordCorrectFormat(password) {
    if (password.length < 6) {
        return false;
    } else {
        return true;
    }
}