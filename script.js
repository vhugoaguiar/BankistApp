'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

//* ------ DATA ------
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

//* ------ ELEMENTS ------
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//* ------ GLOBAL VARIABLES ------
let currentAccount; // Current logged user
let sorted = false; // Controls the movements sorting functionality

//* ------ FUNCTIONS ------
/**
 * Displays the user movements on the screen
 * @param {Array<number>} movements An array with the user movements
 * @param {boolean} sort If true, sorts the movements
 **/
const displayMovements = (movements, sort = false) => {
  // Clean the previous content
  containerMovements.innerHTML = '';

  // Sorts the array if the sort parameter is true
  // The slice method is used to make a shallow copy of the orignal array, so the sorting does not mutate the original one
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  // Iterate over the movements array, creating a row element for each one
  movs.forEach((movement, i) => {
    const type = movement > 0 ? 'deposit' : 'withdrawal';
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__value">${movement}</div>
    </div>`; //The html for the movement row

    // Insert the html of the movement row into the movements container.
    containerMovements.insertAdjacentHTML('afterbegin', html); // "afterbegin" inserts the content in the start of the element
  });
};

/**
 * Calculates and Displays the user balance on the screen
 * @param {object} account The current user object
 **/
const calcDisplayBalance = account => {
  account.balance = account.movements.reduce(
    (acc, currentValue) => acc + currentValue,
    0
  );
  labelBalance.textContent = `${account.balance} EUR`;
};

/**
 * Calculates and displays a summary of a current account.
 *
 * @param {object} account - The current account object.
 * @param {Array<number>} account.movements - An array of movement values representing deposits and withdrawals.
 * @param {number} account.interestRate - The interest rate applied to deposits for calculating interest.
 */
const calcDisplaySummary = ({ movements, interestRate }) => {
  const incomes = movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes} EUR`;

  const outcomes = movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(outcomes)} EUR`;

  // This fictional bank pays an interest each time there is a deposit, if the interest is greater then 1 EUR
  const interest = movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * interestRate) / 100)
    .filter(int => int > 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest} EUR`;
};

/**
 * Compute usernames for each account and stores then as a property in the account object
 * - User names are composed by the account owner initials, underscored
 * @param {object[]} accounts An array of account objects
 **/
const createUserNames = accounts => {
  accounts.forEach(account => {
    // For each account, create a username property based on the owner's name
    account.userName = account.owner
      .split(' ')
      .map(name => name[0])
      .join('')
      .toLowerCase();
  });
};
createUserNames(accounts);

/**
 * Checks if the current transfer is valid
 * @param {object} receiverAccount Receiver account object
 * @param {number} amount Amount to be transfered
 * @returns {boolean} true if the transfer is valid, false if it's not
 */
const validateTransfer = (receiverAccount, amount) =>
  receiverAccount &&
  amount > 0 &&
  currentAccount.balance >= amount &&
  receiverAccount?.userName !== currentAccount.userName;

/**
 * Updates the UI with the current values
 * @param {object} account The current account object
 */
const updateUI = account => {
  // Display movements
  displayMovements(account.movements);

  // Display balance
  calcDisplayBalance(account);

  // Display sumary
  calcDisplaySummary(account);
};

/**
 * Updates the UI visibility
 * @param {string} command 'show' displays the UI, while 'hide' hides it
 * - In the author's orignal implementation, only the opacity was changed, so while not visible the UI could still be interacted with.
 * This function corrects it while still maintaining the fade in/out opacity effect
 */
const updateUIVisibility = command => {
  if (command === 'show') {
    // Sets display to grid
    containerApp.style.display = 'grid';
    // Then UI fades in
    setTimeout(() => (containerApp.style.opacity = 100), 200);
  } else if (command === 'hide') {
    // UI fades out
    containerApp.style.opacity = 0;
    // Then display is set to none
    setTimeout(() => (containerApp.style.display = 'none'), 1000);
  }
};

// This bank only grants a loan if there's at least one deposit with 10% the amount requested
const validateLoan = amount =>
  amount > 0 &&
  currentAccount.movements.some(movement => movement >= amount * 0.1);

//* ------ Event handlers ------

//* Login button
btnLogin.addEventListener('click', event => {
  // Prevent form from submiting
  event.preventDefault();
  // When using form, hitting enter in one of it's fiels it's the same as clicking the submit button

  // Find the user that made the login
  currentAccount = accounts.find(
    account => account.userName === inputLoginUsername.value
  );

  // Check if the pin is correct (I'm using optional chaining to check if the user exists before acessing it's pin)
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and welcome message
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(' ')[0]
    }`;

    // Display UI
    updateUIVisibility('show');

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginUsername.blur();
    inputLoginPin.blur();

    // Update the user interface
    updateUI(currentAccount);
  }
});

//* Transfer Button
btnTransfer.addEventListener('click', event => {
  event.preventDefault();

  // Get the value and receiver account (object)
  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(
    account => account.userName === inputTransferTo.value
  );

  inputTransferAmount.value = inputTransferTo.value = '';

  if (validateTransfer(receiverAccount, amount)) {
    currentAccount.movements.push(-amount); // insert the negative movement on the current account
    receiverAccount.movements.push(amount); // insert the positive value in the receiver amount
    // Update the user interface
    updateUI(currentAccount);
  } else {
    alert(
      'Transfer unsuccessful, please check the username/amount and try again'
    );
  }
});

//* Request loan button
btnLoan.addEventListener('click', event => {
  event.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (validateLoan(amount)) {
    // Add the movement
    currentAccount.movements.push(amount);
    // Update the UI
    updateUI(currentAccount);
  } else {
    alert('Requested amount not aproved');
  }

  inputLoanAmount.value = '';
});

//* Close account button
btnClose.addEventListener('click', event => {
  event.preventDefault();
  const closeUsername = inputCloseUsername.value;
  const closePin = Number(inputClosePin.value);

  // Check credentials
  if (
    closeUsername === currentAccount.userName &&
    closePin === currentAccount.pin
  ) {
    // Delete user from accounts array
    const accountIndex = accounts.findIndex(
      account => closeUsername === account.userName
    );

    // Delete the account
    accounts.splice(accountIndex, 1); // Mutates the original array

    // Hide the UI
    updateUIVisibility('hide');

    // Clear the input fields
    inputCloseUsername.value = inputClosePin.value = '';
  }
});

//* Sorting button
btnSort.addEventListener('click', event => {
  event.preventDefault();
  // Call the displayMovements function with the sorting argument
  // If the array is not sorted (sorted = false), calls it with true, else, calls it with false
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted; // Switches the sorted value
});
