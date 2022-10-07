pragma solidity ^0.5.0;

contract SplitBits {

     struct Participant {
        string name;
        address waddress;
        int balance;
    }

    // Our constructor
    constructor() {
        participants["0xa3e5956BDEeB9098723152B64b741e6F8C3d510E"] = Participant({name:"Shubh",waddress:"0xa3e5956BDEeB9098723152B64b741e6F8C3d510E", balance: 0});
        participants["0x3c294F5aF1515d05C89680d50a653056A69970D9"] = Participant({name:"Harshit",waddress:"0x3c294F5aF1515d05C89680d50a653056A69970D9",balance:0});
        participants["0x3A5de49BEF89E85e747D36a868f4975cC562149D"] = Participant({name:"Kashish",waddress:"0x3A5de49BEF89E85e747D36a868f4975cC562149D",balance:0});

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

    Expense[] public expenses;

    Payment[] public payments;

    function createParticipant(string memory _name, address _waddress) public {
        require(_waddress != participants[_waddress].waddress);
        Participant memory participant = Participant({name: _name, waddress: _waddress, balance: 0});
        participants[_waddress] = participant;
    }

   
    function createExpense(string memory _title, uint _amount, address[] memory _payees) public {
        require(_amount > 0);
        require(_payees.length > 0 && _payees.length <= 20);
        require(msg.sender == participants[msg.sender].waddress);
        require(isParticipants(_payees));
        Expense memory expense = Expense(_title, _amount, msg.sender, _payees);
        expenses.push(expense);
        calculateBalance((expenses.length)-1);
    }

    mapping(address => uint) public withdrawals;
    
    function createPayment(string memory _title, address _payee) public payable {   
        require(msg.value > 0);
        require(_payee != msg.sender);
        require(msg.sender == participants[msg.sender].waddress);
        require(_payee == participants[_payee].waddress);
        Payment memory payment = Payment({title: _title, amount: msg.value, payer: msg.sender, payee: _payee});
        payments.push(payment);
        withdrawals[_payee] += msg.value;
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

    function withdraw() public  {
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