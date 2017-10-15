//Ask for Legal adivce

const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')

let bot = new Bot()

// ROUTING

bot.onEvent = function(session, message) {
  switch (message.type) {
    case 'Init':
      welcome(session)
      break
    case 'Message':
      onMessage(session, message)
      break
    case 'Command':
      onCommand(session, message)
      break
    case 'Payment':
      onPayment(session, message)
      break
    case 'PaymentRequest':
      welcome(session)
      break
  }
}

var question = "No questions"
var answer = null;
function onMessage(session, message) {
  switch (session.get('convostate')){
    case 'question':
      question = message.body
      session.reply(SOFA.Message({
      body: 'How much are you willing to award the first advisor who gives you a satisfactory answer?\n\nAwaiting for response....\n\n(A satisfactory response appears)',
      controls: [
      {
        type:"group",
        label: 'Pay with USD',
        controls:[
        {type: 'button', label: '$1', value: 'one'},
        {type: 'button', label: '$2', value: 'two'},
        {type: 'button', label: '$5', value: 'five'}
        ]
      },
      {
        type:"group",
        label: 'Pay with Ether',
        controls: [
        {type:'button',label: '0.01 ETH', value: 'one_eth'},
        {type:'button',label: '0.02 ETH', value: 'two_eth'},
        {type:'button',label: '0.05 ETH', value: 'five_eth'}
        ]
      },
      {value: 'button', label: 'USD/ETH Rates', action: "Webview::https://www.coinbase.com/charts"}


      ],
      showKeyboard: false,
    }))
      session.set('convostate', null)
      break

    case 'answer':
      answer = message.body
      session.reply("Thank you for your response, we will notify you if your response is accepted!")
      session.set('convostate', null)
      break

    default:
      welcome(session);
      break

  }



}

function onCommand(session, command) {
  switch (command.content.value) {
    // case 'ping':
    //   pong(session)
    //   break
    // case 'count':
    //   count(session)
    //   break
    // case 'donate':
    //   donate(session)
    //   break
    case 'adv':
      advisor(session);
      break
    case 'inq':
      inquirer(session);
      break
    case 'yes':
      list(session);
      break
    case 'exit':
      welcome(session);
      break
    case 'one':
      //wait answer
      fiat_payment(session,1)
      break
    case 'two':
      //wait answer
      fiat_payment(session,2)
      break
    case 'five':
      fiat_payment(session,5)
      break
    case 'one_eth':
      eth_payment(session,0.01)
      break
    case 'two_eth':
      eth_payment(session,0.02)
      break
    case 'five_eth':
      eth_payment(session,0.05)
      break
    
    case 'ans':
      session.set('convostate', 'answer')
    //store answer
      break
  }
}

function onPayment(session, message) {
  if (message.fromAddress == session.config.paymentAddress) {
    // handle payments sent by the bot
    if (message.status == 'confirmed') {
      // perform special action once the payment has been confirmed
      // on the network
    } else if (message.status == 'error') {
      // oops, something went wrong with a payment we tried to send!
    }
  } else {
    // handle payments sent to the bot
    if (message.status == 'unconfirmed') {
      // payment has been sent to the ethereum network, but is not yet confirmed
      sendMessage(session, `Thanks for the payment! 🙏`);
    } else if (message.status == 'confirmed') {
      // handle when the payment is actually confirmed!
    } else if (message.status == 'error') {
      sendMessage(session, `There was an error with your payment!🚫`);
    }
  }
}

// STATES

function welcome(session) {
    session.reply(SOFA.Message({
    body: 'Hello, welcome to Law4all. Are you here for an Inquiry or as a Certified Legal Advisor?',
    controls: [
        {type: 'button', label: 'Advisor', value: 'adv'},
        {type: 'button', label: 'Inquirer', value: 'inq'}
      ],
    showKeyboard: false,
  }))


}

function advisor(session){

    session.reply(SOFA.Message({
    body: 'Do you want to see a list of inquiries?',
    controls: [
        {type: 'button', label: 'Yes', value: 'yes'}
      ],
    showKeyboard: false,
  }))
}

function inquirer(session){
    session.reply(SOFA.Message({
    body: 'Please enter your legal question below:',
    showKeyboard: true,
  }))
    session.set('convostate', 'question')
}


function list (session){
    session.reply(SOFA.Message({
    body: 'Here is a list of current inquiries:\n'.concat(question).concat('\n\nWould you like to answer any of the listed inquiries?') ,
    controls: [
        {type: 'button', label: question, value: 'ans'},
        {type: 'button', label: 'Exit', value: 'exit'}
      ],
    showKeyboard: false,
  }))
}

function fiat_payment(session,amount){
    Fiat.fetch(10*1000).then((toEth) => {
    session.requestEth(toEth.USD(amount), 'FOR FAIRNESS')
  })
}

function eth_payment(session,amount){
  session.requestEth(amount, "FOR FAIRNESS")
}

// function answer (session){
//   //code for ether quotes
//   sendMessage(session,'How many dollars worth of ether do you want to sell?', 4)
// }

// function pong(session) {
//   sendMessage(session, `Pong`)
// }

// example of how to store state on each user
// function count(session) {
//   let count = (session.get('count') || 0) + 1
//   session.set('count', count)
//   sendMessage(session, `${count}`)
// }

// function donate(session) {
//   // request $1 USD at current exchange rates
//   Fiat.fetch().then((toEth) => {
//     session.requestEth(toEth.USD(1))
//   })
// }

// HELPERS

function sendMessage(session, message, entry) {

      let controls = [
        {type: 'button', label: 'Exit', value: 'exit'}
      ]

  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}
