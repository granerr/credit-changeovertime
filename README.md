# Testing Credit Changes Over Time

This is a quick exercise to develop a series of tests for a Sequelize model with an afterCreate hook that implements a timed-interval update.

So, given a card that functions as follows:

- Each card has an APR and Credit Limit.
- Interest is calculated daily, starting the day after the account is opened, at the close of each day.
- Calculated interest becomes due at the close every 30 days after the account has been opened.
  e.g., asking for the total outstanding balance 15, 28, or 29 days after opening will give the outstanding balance, but asking for balance 30 days after opening will give the outstanding balance plus the accrued interest.

This app tests for the following functionality:

- Create an account (e.g. opening a new credit card)
- Keep track of charges (e.g. card swipes)
- Keep track of payments
- Provide the total outstanding balance as of any given day

## Quick Start

```bash

# Create database
createdb credit-changeovertime

# Enter workspace
cd credit-changeovertime

# Install dependencies
npm install

# Seed database
npm run seed

# Start development server
npm start

# Run tests
npm test

```

## Stack

The stack for this project includes webpack, React, express, and node. Testing makes use of Mocha and Sinon.

## API

Call the API at http://localhost:8080/api/cards, http://localhost:8080/api/charges, and http://localhost:8080/api/payments.
