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
        // await App.renderExpenses();
        await App.renderParticipants();
        await App.renderPayments();
      },

      createParticipant: async () => {
        const participantName = $('#participantName').val()
        const participantAddress = $('#participantAddress').val()
        // console.log(participantName, participantAddress)
        await App.splitBits.createParticipant(participantName, participantAddress,{from:App.account,gas:3000000})
        window.location.reload();
      },

      renderParticipants: async () => {
        const w = await App.splitBits.withdrawals('0x28e54DE9DE8D4261Cd6e57bF9cc5E8932DA719a5');
        console.log(w)
        const participantCount = await App.splitBits.participantCount()
        const $participantTemplate = $('.participantTemplate')
        // console.log(participantCount)
        // console.log(await App.splitBits.participants("0xe8cF0D2844148EC8590B70063F55C4F7696F8e0F"))
    
        // Render out each expense with a new expense template
        for (var i = 0; i < participantCount['c']; i++) {
          const address = await App.splitBits.participantsAddresses(i)
          const participant = await App.splitBits.participants(address)
          const participantName = participant[0]
          const participantAddress = participant[1]
          const participantBalance = participant[2]['c'] * participant[2]['s']
          // console.log(participant)
         
          // Create the html for the expense
          const $newParticipantTemplate = $participantTemplate.clone()
          $newParticipantTemplate.find('.name').html(participantName)
          $newParticipantTemplate.find('.address').html(participantAddress)
          $newParticipantTemplate.find('.balance').html(participantBalance)
          
        $('#participantList').append($newParticipantTemplate)
        
        if(address != App.account ){
          $('#involvedParticipants').append(`<option value="` + participantAddress +  `" data-badge="">`+ participantName + `</option>`) 
          $('#payParticipant').append(`<option value="` + participantAddress +  `" data-badge="">`+ participantName + `</option>`) 
        } 
          
          $newParticipantTemplate.show()
      }
      },

      withdraw: async () => {
        await App.splitBits.withdraw({from:App.account,gas:3000000});
        window.location.reload(); 
      },

      createPayment: async () => {
        const paymentAmount = $('#payParticipantAmount').val()
        const title = $('#payTitle').val()
        const paymentTo = $('#payParticipant').val()

        // console.log(paymentAmount, title, paymentTo)
        // web3.eth.sendTransaction({from:App.account, to: paymentTo, })
        await App.splitBits.createPayment(title,paymentTo, paymentAmount,{from:App.account,gas:3000000,"value": web3.toWei(paymentAmount, "ether"), to:paymentTo})
        window.location.reload()

      },

      renderPayments: async () => {
        const paymentCount = await App.splitBits.paymentCount()
        const $paymentTemplate = $('.paymentTemplate')
    
        // Render out each expense with a new expense template
        for (var i = 0; i < paymentCount['c']; i++) {
          const payment = await App.splitBits.payments(i)
          // console.log(payment)
          const paymentTitle = payment[0]
          const paymentAmount = payment[1].toNumber()
          const participant = await App.splitBits.participants(payment[3])
          const paymentPaidTo = participant[0]
          
    
          // Create the html for the expense
          const $newPaymentTemplate = $paymentTemplate.clone()
          $newPaymentTemplate.find('.payment_title').html(paymentTitle)
          $newPaymentTemplate.find('.payment_amount').html(paymentAmount)
          $newPaymentTemplate.find('.payment_paid_to').html(paymentPaidTo)
          
        $('#paymentList').append($newPaymentTemplate)

          $newPaymentTemplate.show()
      }
      },
          
      createExpense: async () => {
        const expenseTitle = $('#newExpenseTitle').val()
        const expenseAmount = $('#newExpenseAmount').val()
        const involvedParticipants = $('#involvedParticipants').val()
        

        involvedParticipants.push(App.account)

        // console.log(involvedParticipants)
        await App.splitBits.createExpense(expenseTitle, expenseAmount, involvedParticipants,{from:App.account,gas:3000000})
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
          
    
          // Create the html for the expense
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