pragma solidity ^0.5.0;

contract SplitBits {
  int public expenseCount = 0;

  struct Expense {
    int id;
    string title;
    int amount;
    string paid_to;
  }

  mapping(int => Expense) public expenses;

  event ExpenseCreated(
    int id,
    string title,
    int amount,
    string paid_to
  );

  
  constructor() public {
    createExpense("Food", 10, "Somaiya");
  }

  function createExpense(string memory _title, int amount, string memory paid_to) public {
    expenseCount ++;
    expenses[expenseCount] = Expense(expenseCount, _title, amount, paid_to);
    emit ExpenseCreated(expenseCount, _title, amount, paid_to);
  }

}