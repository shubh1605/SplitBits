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
    
        console.log(App.account);
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
        // App.splitBits.createParticipant('Shubh',App.account)
      },

          
      createExpense: async () => {
       console.log("here")
        const expenseTitle = $('#newExpenseTitle').val()
        const expenseAmount = $('#newExpenseAmount').val()
        const expensePaidTo = $('#newExpensePaidTo').val()
        await App.splitBits.createExpense(expenseTitle, expenseAmount, expensePaidTo,{from:App.account,gas:3000000})
        window.location.reload()
      },      
  
  
      

      renderExpenses: async () => {
        // Load the total task count from the blockchain
        const expenseCount = await App.splitBits.expenseCount()

        // const test = await App.splitBits.expenses(0)

        const $expenseTemplate = $('.expenseTemplate')
        console.log(expenseCount)
    
        // Render out each task with a new task template
        for (var i = 1; i <= expenseCount['c']; i++) {
          const expense = await App.splitBits.expenses(i)
                    console.log(expense)

          const expenseTitle = expense[1]
          const expenseAmount = expense[2].toNumber()
          const expensePaidTo = expense[3]
          
    
        //   // Create the html for the task
          const $newExpenseTemplate = $expenseTemplate.clone()
          $newExpenseTemplate.find('.title').html(expenseTitle)
          $newExpenseTemplate.find('.amount').html(expenseAmount)
          $newExpenseTemplate.find('.paid_to').html(expensePaidTo)
          // $newExpenseTemplate.find('input')
          //                 .prop('name', taskId)
          //                 .prop('checked', taskCompleted)
          //                 .on('click', App.toggleCompleted)
    
        //   // Put the task in the correct list
        //   if (taskCompleted) {
        //     $('#completedTaskList').append($newTaskTemplate)
        //   } else {
        //     $('#taskList').append($newTaskTemplate)
        //   }
        $('#expenseList').append($newExpenseTemplate)

    
        //   // Show the task
          $newExpenseTemplate.show()
        // }
      }

      


},
}

$(() => {
  $(window).load(() => {
    App.load()
  })
})