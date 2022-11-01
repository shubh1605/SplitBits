pragma solidity ^0.5.0;

contract SplitBits {

    // Our constructor
    //constructor() {
    //}
    int public expenseCount = 0;
    int public participantCount = 0;
    int public paymentCount = 0;

    struct Participant {
        string name;
        address waddress;
        int balance;
    }

    struct Expense {
        string title;
        uint amount;
        address payer; 
        address[] payees; 
    }

    struct Payment {
        string title;
        uint amount;
        address payer;
        address payee;
    }

    mapping(address => Participant) public participants;
    mapping(int => address) public participantsAddresses;

    Expense[] public expenses;

    Payment[] public payments;

    function createParticipant(string memory _name, address _waddress) public {
        require(_waddress != participants[_waddress].waddress);
        Participant memory participant = Participant({name: _name, waddress: _waddress, balance: 0});
        participants[_waddress] = participant;
        participantsAddresses[participantCount] = _waddress;
        participantCount++;
    }

    function createExpense(string memory _title, uint _amount, address[] memory _payees) public {
        require(_amount > 0);
        require(_payees.length > 0 && _payees.length <= 20);
        require(msg.sender == participants[msg.sender].waddress);
        require(isParticipants(_payees));
        Expense memory expense = Expense(_title, _amount, msg.sender, _payees);
        expenses.push(expense);
        calculateBalance((expenses.length)-1);
        expenseCount++;
    }

    mapping(address => uint) public withdrawals;
    
    function createPayment(string memory _title, address _payee, uint _amount) public payable {   
        require(_amount > 0);
        require(_payee != msg.sender);
        require(msg.sender == participants[msg.sender].waddress);
        require(_payee == participants[_payee].waddress);
        Payment memory payment = Payment({title: _title, amount: _amount, payer: msg.sender, payee: _payee});
        payments.push(payment);
        paymentCount++;
        withdrawals[_payee] += _amount;
        syncBalancePayment(payment);
    }

    function syncBalancePayment(Payment memory payment) internal {
        participants[payment.payee].balance -= int(payment.amount);
        participants[payment.payer].balance += int(payment.amount);
    }


    function calculateBalance(uint indexExpense) public {
        Expense storage expense = expenses[indexExpense];
        uint contributors = expense.payees.length;
        require(contributors > 0);
        int _portion = int(expense.amount / contributors);
        int _amount = int(expense.amount);
        
        participants[expense.payer].balance += _amount;
        for (uint i = 0; i < expense.payees.length; i++) {
            participants[expense.payees[i]].balance -= _portion;  
        }       
    }

    function withdraw() public payable {
        require(withdrawals[msg.sender] > 0);
        uint amount = withdrawals[msg.sender];
        withdrawals[msg.sender] = 0;
        msg.sender.transfer(amount);
    }

    function isParticipants(address[] memory list) internal returns (bool) {
        for (uint i = 0; i < list.length; i++) {
            if (!isParticipant(list[i])) {
                return false;
            }
        }
        return true;
    }

    /// @notice Check if each address of the list is registred as participant
    /// @param _waddress the address to check 
    /// @return true if all the list is registred as participant, false otherwise
    function isParticipant(address _waddress) internal returns (bool) {
        if (_waddress == participants[_waddress].waddress) {
            return true;
        }else {
            return false;
        }
    }

}