App = {
    contracts: {},
    load: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
    },

    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
        } else {
        window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
            // Request account access if needed
            await ethereum.enable()
            // Acccounts now exposed
            web3.eth.sendTransaction({/* ... */})
        } catch (error) {
            // User denied account access...
        }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
        App.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */})
        }
        // Non-dapp browsers...
        else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    loadAccount: async () => {
        // Set the current blockchain account
        App.account = web3.eth.accounts[0]
    
    },

    loadContract: async () => {
        // Create a JavaScript version of the smart contract
        const splitBits = await $.getJSON('SplitBits.json')
        App.contracts.SplitBits = TruffleContract(splitBits)
        App.contracts.SplitBits.setProvider(App.web3Provider)
    
        // Hydrate the smart contract with values from the blockchain
        App.splitBits = await App.contracts.SplitBits.deployed()
      },

      render: async () => {    
        // Render Account
        $('#username').html(App.account)
        await App.renderExpenses();
      },

          
      createExpense: async () => {
        const expenseTitle = $('#newExpenseTitle').val()
        const expenseAmount = $('#newExpenseAmount').val()
        const expensePaidTo = $('#newExpensePaidTo').val()
        await App.splitBits.createExpense(expenseTitle, expenseAmount, expensePaidTo,{from:App.account,gas:3000000})
        window.location.reload()
      },      

      renderExpenses: async () => {

        // Load the total expense count from the blockchain
        const expenseCount = await App.splitBits.expenseCount()
        const $expenseTemplate = $('.expenseTemplate')
    
        // Render out each expense with a new expense template
        for (var i = 1; i <= expenseCount['c']; i++) {
          const expense = await App.splitBits.expenses(i)
          const expenseTitle = expense[1]
          const expenseAmount = expense[2].toNumber()
          const expensePaidTo = expense[3]
          
    
        //   // Create the html for the expense
          const $newExpenseTemplate = $expenseTemplate.clone()
          $newExpenseTemplate.find('.title').html(expenseTitle)
          $newExpenseTemplate.find('.amount').html(expenseAmount)
          $newExpenseTemplate.find('.paid_to').html(expensePaidTo)
          
        $('#expenseList').append($newExpenseTemplate)

          $newExpenseTemplate.show()
      }
},
}

$(() => {
  $(window).load(() => {
    App.load()
  })
})