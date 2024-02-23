import { initializeApp } from 'firebase/app';
import { child, getDatabase, onValue, push, ref, remove, set, update } from 'firebase/database';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import typeahead from 'typeahead-standalone';

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

const inputField = document.querySelector('.input-field--js');
const addButton = document.querySelector('.add-button--js');
const shoppingList = document.querySelector('.shopping-list--js');
const shoppingContainer = document.querySelector('.shopping-container--js');
const loginContainer = document.querySelector('.login-container--js');

let autocompleteItems = [];
let instance = null;

//auth code functions below

const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');
const logoutButton = document.getElementById('logoutButton');
const errorMessageContainer = document.querySelector('.error-message--js');

loginButton.addEventListener('click', login);
registerButton.addEventListener('click', register);
logoutButton.addEventListener('click', logout);

const auth = getAuth(app);
const currentUser = auth.currentUser;

function isLogged() {
    if (auth.currentUser !== null) {
        return true;
    } else {
        return false;
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        if(shoppingContainer.classList.contains('hidden')) {
            shoppingContainer.classList.remove('hidden');
        }
        if(loginContainer.classList.contains('hidden') == false) {
            loginContainer.classList.add('hidden');
        }
        if(logoutButton.classList.contains('hidden')) {
            logoutButton.classList.remove('hidden');
        }

        const uid = user.uid;
        const shoppingListDatabase = ref(database, 'users/' + uid + '/shoppingList');
        const autocompleteItemsDatabase = ref(database, 'users/' + uid + '/autocompleteItems');
        
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
            }
        });

        if (instance != null) {
            instance.reset(true);
        }
        //make instance object global: (instance = ...) - working on localhost but not on netlify :(
        instance = typeahead({
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
                clearInputField(inputField);
                inputField.blur();
            }
        });

        const userData = {
            lastLogin: Date.now()
        }
        updateUserData(user, userData);

    } else {
        autocompleteItems = [];
        clearInputField(inputField);

        if(shoppingContainer.classList.contains('hidden') == false) {
            shoppingContainer.classList.add('hidden');
        }
        if(loginContainer.classList.contains('hidden')) {
            loginContainer.classList.remove('hidden');
        }
        if(logoutButton.classList.contains('hidden') == false) {
            logoutButton.classList.add('hidden');
        }
    }
});

addButton.addEventListener('click', () => {
    pushToDatabase(inputField.value);

    clearInputField(inputField);
});

function clearInputField(inputField) {
    inputField.value = '';
}

function clearShoppingList() {
    shoppingList.innerHTML = '';
}

function pushToDatabase(inputValue) {
    const regex = /[a-zA-Z0-9]/;

    const shoppingListDatabase = ref(database, 'users/' + auth.currentUser.uid + '/shoppingList');

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
        let exactLocationItemInDb = ref(database, `users/${auth.currentUser.uid}/shoppingList/${itemId}`);
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
    const autocompleteItemsDatabase = ref(database, 'users/' + auth.currentUser.uid + '/autocompleteItems');
    push(autocompleteItemsDatabase, changeFirstLetterUpperCase(item));
}

function changeFirstLetterUpperCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}



function updateUserData(user, userData) {
    const databaseRef = ref(database, 'users');
    const userRef = child(databaseRef, user.uid);

    update(userRef, userData);
}

function register() {
    const email = document.getElementById('email');
    const emailValue = email.value;
    const password = document.getElementById('password');
    const passwordValue = password.value;

    clearInputField(email);
    clearInputField(password);

    //check input fields format
    if (isEmailCorrectFormat(emailValue) == false || isPasswordCorrectFormat(passwordValue) == false) {
        showLoginError('Złe dane logowania!');
        return;
    }

    const auth = getAuth(app);
    createUserWithEmailAndPassword(auth, emailValue, passwordValue)
    .then((userCredential) => {
        //signed up
        const user = userCredential.user;
        //add user to database
        const databaseRef = ref(database, 'users');

        const userData = {
            email: emailValue,
            lastLogin: Date.now()
        }

        const userRef = child(databaseRef, user.uid);
        set(userRef, userData);

    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        switch (errorCode) {
            case 'auth/email-already-in-use':
                showLoginError('Mail już istnieje!');
                break;
            default:
                showLoginError(errorCode);
                break;
        }
    });
}

function login() {
    const email = document.getElementById('email');
    const emailValue = email.value;
    const password = document.getElementById('password');
    const passwordValue = password.value;

    clearInputField(email);
    clearInputField(password);

    //check input fields format
    if (isEmailCorrectFormat(emailValue) == false || isPasswordCorrectFormat(passwordValue) == false) {
        showLoginError('Złe dane logowania!');
        return;
    }

    signInWithEmailAndPassword(auth, emailValue, passwordValue)
    .then((userCredential) => {
        //signed up
        const user = userCredential.user;
        const userData = {
            lastLogin: Date.now()
        }

        updateUserData(user, userData);
        
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        
        if (errorCode == 'auth/invalid-credential') {
            showLoginError('Złe dane logowania!');
        }
        else {
            showLoginError('Błąd!');
            console.log(errorMessage + '\n' + errorCode);
        }
    });
}

function logout() {
    signOut(auth)
    .then(() => {
        showLoginError('Wylogowano!');
    }).catch((error) => {
        console.log(error);
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

function showLoginError(error) {
    errorMessageContainer.classList.remove('hidden');
    errorMessageContainer.textContent = error;
}