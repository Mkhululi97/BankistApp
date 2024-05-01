'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
// const account1 = {
//   owner: 'Jonas Schmedtmann',
//   movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
//   interestRate: 1.2, // %
//   pin: 1111,
// };

// const account2 = {
//   owner: 'Jessica Davis',
//   movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
//   interestRate: 1.5,
//   pin: 2222,
// };

// const account3 = {
//   owner: 'Steven Thomas Williams',
//   movements: [200, -200, 340, -300, -20, 50, 400, -460],
//   interestRate: 0.7,
//   pin: 3333,
// };

// const account4 = {
//   owner: 'Sarah Smith',
//   movements: [430, 1000, 700, 50, 90],
//   interestRate: 1,
//   pin: 4444,
// };

// const accounts = [account1, account2, account3, account4];

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2024-03-23T17:01:17.194Z',
    '2024-03-26T23:36:17.929Z',
    '2024-03-28T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2024-03-10T14:43:26.374Z',
    '2024-03-25T18:49:59.371Z',
    '2024-03-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////

// Elements
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
/* -------------------------------------- GLOBAL VARIABLES -------------------------------------- */
let currentAccount, logoutInterval;
let sorted = false;
/* -------------------------------------- FUNCTIONS -------------------------------------- */
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = function (date1, date2) {
    return Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  };
  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const startLogOutTimer = function () {
  //set time to 5mins
  let time = 120;
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    //in each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;
    //decrease 1s
    time--;
    //when 0 secnds, stop timer and log out user
    if (time < 0) {
      clearInterval(logoutInterval);
      //Display UI and welcome message
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }
  };
  tick();
  //call the timer every second
  logoutInterval = setInterval(tick, 1000);
  return logoutInterval;
};

const displayMovements = function (account, sorted) {
  let { movements, locale, currency } = account;
  containerMovements.innerHTML = '';
  const movs = sorted
    ? movements.slice().sort((a, b) => {
        return a - b;
      })
    : movements;
  movs.forEach((movement, i) => {
    const type = movement > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(account.movementsDates[i]);
    const displayDate = formatMovementDate(date, account.locale);
    const formattedMovement = formatCurrency(movement, locale, currency);
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMovement}</div>
    </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (account) {
  let { movements, locale, currency } = account;

  account.balance = movements.reduce((accumulator, movement) => {
    return accumulator + movement;
  }, 0);
  const formattedBalance = formatCurrency(account.balance, locale, currency);

  labelBalance.textContent = `${formattedBalance}`;
};

const calcDisplaySummary = function (account) {
  let { movements, locale, currency } = account;

  //deposits
  const incomes = movements
    .filter(movement => {
      return movement > 0;
    })
    .reduce((acc, movement) => {
      return acc + movement;
    }, 0);
  const formattedIncome = formatCurrency(incomes, locale, currency);
  labelSumIn.textContent = `${formattedIncome}`;

  //withdrawal
  const out = movements
    .filter(movement => {
      return movement < 0;
    })
    .reduce((accumulator, movement) => {
      return accumulator + movement;
    }, 0);
  const formattedWithdrawal = formatCurrency(Math.abs(out), locale, currency);
  labelSumOut.textContent = `${formattedWithdrawal}`;

  //interest
  const interest = movements
    .filter(deposit => {
      return deposit > 0;
    })
    .map(deposit => {
      return (deposit * account.interestRate) / 100;
    })
    .filter(interest => {
      return interest >= 0;
    })
    .reduce((accumulator, interest) => {
      return accumulator + interest;
    }, 0);
  const formattedInterest = formatCurrency(interest, locale, currency);
  labelSumInterest.textContent = `${formattedInterest}`;
};

const createUsernames = function (userAccounts) {
  userAccounts.forEach(userAccount => {
    //get name for account holder
    userAccount.username = userAccount.owner
      //format the name to lower case
      .toLowerCase()
      //create array with names separated by a space
      .split(' ')
      //for all names in this array grab their first letter
      .map(name => {
        //create new array with first letters of users name
        return name[0];
      })
      //create string with first letters of users name
      .join('');
  });
};

const updateUI = function (currentAccount) {
  //Display movements
  displayMovements(currentAccount);
  //Display balance
  calcDisplayBalance(currentAccount);
  //Display summary
  calcDisplaySummary(currentAccount);
};

createUsernames(accounts);

let usernamepsswrd = '';
const credentials = accounts.forEach(account => {
  usernamepsswrd += `\nuser: ${account['username']}     pin: ${account['pin']}`;
});

alert(`login details: ${usernamepsswrd}`);
/* -------------------------------------- EVENT HANDLERS -------------------------------------- */
//LOG USERS IN
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(account => {
    return account.username === inputLoginUsername.value;
  });
  if (currentAccount?.pin === +inputLoginPin.value) {
    //Clear input fields
    inputLoginPin.value = inputLoginUsername.value = '';
    //hide cursor and focus
    inputLoginPin.blur();
    inputLoginUsername.blur();
    //Display UI and welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    //create current date and time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    //stop the current timer
    logoutInterval && clearInterval(logoutInterval);
    //start a new timer
    logoutInterval = startLogOutTimer();
    //updateUI
    updateUI(currentAccount);
  }
});

//USER TRANSFERS
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  //get amount to be transfered
  const amount = +inputTransferAmount.value;
  //get account to transfered too
  const receiverAccount = accounts.find(account => {
    return account.username === inputTransferTo.value;
  });
  //is the receiver account a valid account
  //is the transfer amount greater than 0
  //is the transfer amount less than the accounts balance
  //is the receiver account not the account doing the transfer
  if (
    receiverAccount &&
    amount > 0 &&
    currentAccount.balance >= amount &&
    receiverAccount.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);
    //add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAccount.movementsDates.push(new Date().toISOString());
    //update UI
    updateUI(currentAccount);
    //clear input fields
    inputTransferAmount.value = inputTransferTo.value = '';
    clearInterval(logoutInterval);
    //start a new timer
    logoutInterval = startLogOutTimer();
  }
});

//USERS REQUEST LOAN
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.movements.some(movement => {
      return movement >= amount * 0.1;
    })
  ) {
    setTimeout(() => {
      //grant the loan
      currentAccount.movements.push(amount);
      //add loan date
      currentAccount.movementsDates.push(new Date().toISOString());
      //update UI
      updateUI(currentAccount);
      //clear input field
    }, 4500);
    inputLoanAmount.value = '';
    clearInterval(logoutInterval);
    //start a new timer
    logoutInterval = startLogOutTimer();
  }
});

//CLOSE USERS ACCOUNT
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(account => {
      return account.username === currentAccount.username;
    });
    //Delete account
    accounts.splice(index, 1);
    //Hide UI
    containerApp.style.opacity = 0;
    //clear input fields
    inputCloseUsername.value = inputClosePin.value = '';
  }
});

//SORT MOVEMENTS
btnSort.addEventListener('click', function () {
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
