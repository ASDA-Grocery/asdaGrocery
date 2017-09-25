'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { wordsToNumbers } = require('words-to-numbers');
const app = express();

function getOrderTime(diff){
  var currentDate = new Date()
  currentDate.setTime(currentDate.getTime() + (diff*60000));
  return currentDate;
}

var shoppingList = {

  daily: {
    productList: [
      {
        productId: 'PR100003',
        productName: 'product3',
        quantity: '3'
      }
    ],
    status: 'resume'
  },

  weekly: {
    productList: [
      {
        productId: 'PR100034',
        productName: 'product34',
        quantity: '3'
      },
      {
        productId: 'PR100035',
        productName: 'product35',
        quantity: '4'
      },
      {
        productId: 'PR100036',
        productName: 'product36',
        quantity: '1'
      }
    ],
    status: 'resume'
  },

  monthly: {
    productList: [
      {
        productId: 'PR100030',
        productName: 'product30',
        quantity: '8'
      },
      {
        productId: 'PR100031',
        productName: 'product31',
        quantity: '3'
      },
      {
        productId: 'PR100039',
        productName: 'product39',
        quantity: '12'
      },
      {
        productId: 'PR100013',
        productName: 'product13',
        quantity: '7'
      }
    ],
    status: 'resume'
  },

  yearly: {
    productList: [
      {
        productId: 'PR100030',
        productName: 'product30',
        quantity: '8'
      },
      {
        productId: 'PR100031',
        productName: 'product31',
        quantity: '3'
      },
      {
        productId: 'PR100039',
        productName: 'product39',
        quantity: '12'
      },
      {
        productId: 'PR100013',
        productName: 'product13',
        quantity: '7'
      },
      {
        productId: 'PR100034',
        productName: 'product34',
        quantity: '3'
      },
      {
        productId: 'PR100035',
        productName: 'product35',
        quantity: '4'
      },
      {
        productId: 'PR100036',
        productName: 'product36',
        quantity: '1'
      }
    ],
    status: 'resume'
  }
}

var orderDb = [
  {
    orderId: 'OR100001',
    productList: [
      {
        productId: 'PR100001',
        productName: 'product1',
        quantity: '2'
      }
    ],
    orderPlacementDate: 'June 23, 2017',
    value: '20 £',
    status: 'closed',
    deliveryTime: getOrderTime(30)
  },
  {
    orderId: 'OR100002',
    productList: [
      {
        productId: 'PR100001',
        productName: 'product1',
        quantity: '2'
      },
      {
        productId: 'PR100004',
        productName: 'product4',
        quantity: '1'
      }
    ],
    orderPlacementDate: 'July 2, 2017',
    value: '35 £',
    status: 'closed',
    deliveryTime: getOrderTime(40)
  },
  {
    orderId: 'OR100003',
    productList: [
      {
        productId: 'PR100002',
        productName: 'product2',
        quantity: '3'
      }
    ],
    orderPlacementDate: 'August 15, 2017',
    value: '15 £',
    status: 'closed',
    deliveryTime: getOrderTime(25)
  },
  {
    orderId: 'OR100004',
    productList: [
      {
        productId: 'PR100001',
        productName: 'product1',
        quantity: '4'
      }
    ],
    orderPlacementDate: 'September 2, 2017',
    value: '40 £',
    status: 'open',
    deliveryTime: getOrderTime(30)
  },
  {
    orderId: 'OR100005',
    productList: [
      {
        productId: 'PR100001',
        productName: 'product1',
        quantity: '2'
      },
      {
        productId: 'PR100002',
        productName: 'product2',
        quantity: '3'
      },
      {
        productId: 'PR100003',
        productName: 'product3',
        quantity: '5'
      }
    ],
    orderPlacementDate: 'September 12, 2017',
    value: '90 £',
    status: 'open',
    deliveryTime: getOrderTime(50)
  }
]

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// app.get('/authentication', (req, res)=>{
//   var token = req.data.user.accessToken;
//   console.log('token vanthuruchu! - > ',token)
// });

app.post('/enquireOrder', function(req, res) {
//    var token = req.data.user.accessToken;
//   console.log('token vanthuruchu! - > ',token);
  
    var speech
      , openCounter = 0
      , intent = req.body.result && req.body.result.metadata.intentName ? req.body.result.metadata.intentName : "noIntent";
    if(intent === 'checkOrderStatus'){
      orderDb.forEach(function(element){
        if(element.status === 'open'){
          openCounter ++;
        }
      })
      if(openCounter == 0){
        speech = 'You have no open orders. Anything else I can help you with?'
      }
      else if(openCounter == 1){
        orderDb.forEach(function(element){
          if(element.status === 'open'){
            var deliveryTimeRem = (element.deliveryTime - new Date())/60000;
            speech = 'It has left our store and will reach you in the next '
                      + Math.ceil(deliveryTimeRem) + ' minutes. Would you like me to help you with anything else?'
          }
        })
      }
      else{
        speech = 'You have ' + openCounter + ' open orders.'
        var tempCount = 1;
        orderDb.forEach(function(element){
          if(element.status === 'open'){
            speech = speech + ' Order ' + tempCount + ' is for ' + element.value 
                     + ' and it was placed on ' + element.orderPlacementDate + '.'                      
            tempCount++;
          }
        })
        speech = speech + ' Which one should I check?'
      }
    }
    else if(intent === 'orderNo-status'){
      var orderNo = req.body.result.parameters.orderN ? parseInt(wordsToNumbers(req.body.result.parameters.orderN)) : 'noOrderNumber'
      if(orderNo === 'noOrderNumber'){
        speech = 'Sorry! Not able to help you this time. Do you want me to help you with anythng else?'
      }
      else{
        var orderCounter = 0;
        for(var i = 0; i < orderDb.length; i++){
          if(orderDb[i].status === 'open'){
            orderCounter++;
            if(orderCounter == orderNo){
              var deliveryTimeRem = (orderDb[i].deliveryTime - new Date())/60000;
              speech = 'It has left our store and will reach you in the next '
                        + Math.ceil(deliveryTimeRem) + ' minutes . Would you like me to help you with anything else?'
              break;
            }
          }
        }
      }
    }
    else if(intent === 'orderDate-status'){
      var orderDateDay = req.body.result.parameters.orderDateDay ? wordsToNumbers(req.body.result.parameters.orderDateDay) : 'noOrderDateDay'
      var orderDateMonth = req.body.result.parameters.orderDateMonth ? req.body.result.parameters.orderDateMonth : 'noOrderDateMonth'
      if(orderDateDay === 'noOrderDateDay' && orderDateMonth === 'noOrderDateMonth'){
        speech = 'Sorry! Not able to help you this time. Do you want me to help you with anything else?'
      }
      else{
        for(var i = 0; i < orderDb.length; i++){
          var tempOrderPlacementDate = orderDb[i].orderPlacementDate.toLowerCase()
          var tempOrderDateDay = orderDateDay.toLowerCase()
          var tempOrderDateMonth = orderDateMonth.toLowerCase()
          if((tempOrderPlacementDate.indexOf(tempOrderDateDay) !== -1) && (tempOrderPlacementDate.indexOf(tempOrderDateMonth) !== -1)){
            var deliveryTimeRem = (orderDb[i].deliveryTime - new Date())/60000;
            speech = 'It has left our store and will reach you in the next '
                      + Math.ceil(deliveryTimeRem) + ' minutes . Would you like me to help you with anything else?'
            break;
          }
        }
      }
    }
    else if(intent === 'orderCost-status'){
      var orderCost = req.body.result.parameters.orderCost ? req.body.result.parameters.orderCost : 'noOrderCost'
      if(orderCost === 'noOrderCost'){
        speech = 'Sorry! Not able to help you this time. Do you want me to help you with anything else?'
      }
      else{
        var orderCounter = 0;
        var result;
        if(orderCost.indexOf('pounds') !== -1)
        {
          result = orderCost.replace("pounds", "£");
          orderCost = result;
        }
        else if(orderCost.indexOf('pound') !== -1 ){
          result = orderCost.replace("pound", "£");
          orderCost = result;
        }
        
        if(orderCost.indexOf('£') == 0){
          orderCost =  orderCost.substr(2, orderCost.length)
          orderCost = orderCost + ' £'         
        }
        
        for(var i = 0; i < orderDb.length; i++){
          if(orderDb[i].value === orderCost){
            var deliveryTimeRem = (orderDb[i].deliveryTime - new Date())/60000;
            speech = 'It has left our store and will reach you in the next '
                      + Math.ceil(deliveryTimeRem) + ' minutes . Would you like me to help you with anything else?'
            break;
          }
        }
      }
    }
    
    else if(intent === 'changeRecurringOrderStatus'){
      var shoppingListName = 'weekly'
      var shoppingStatus = 'hold'
      if(shoppingListName === 'noShoppingListName'){
        speech = 'Sorry! No such list exists. Something else I can help you with?'
      }
      else{
        if(shoppingStatus === 'noShoppingStatus'){
          speech = 'No a valid status. Please provide a valid status.'
        }
        else{
          if(shoppingStatus === 'hold' ||shoppingStatus === 'pause' || shoppingStatus === 'stop'){
            shoppingList[shoppingListName].status = 'hold'
            var tempList = shoppingListName.charAt(0).toUpperCase() + shoppingListName.slice(1)
            speech = "Sure. '" + tempList +  "' shopping list has been put on hold."
          }
          else if(shoppingStatus === 'resume' ||shoppingStatus === 'start' || shoppingStatus === 'restart'){
            shoppingList[shoppingListName].status = 'resume'
            var tempList = shoppingListName.charAt(0).toUpperCase() + shoppingListName.slice(1)
            speech = "Sure. '" + tempList +  "' shopping list has been put on resume."
          }
          else{
            speech = 'No a valid status. Please provide a valid status.'
          }
        }
      }
    }
  
    else{
      speech = 'Sorry! Unable to Understand'
    }
    //var tempData = req.query;
    return res.json({
        speech: speech,
        displayText: speech,
        source: 'webhook-asda-assistant'
    });
});

app.listen((process.env.PORT || 8000), function() {
    console.log("Server up and listening");
});
