'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { wordsToNumbers } = require('words-to-numbers');
const app = express();
var orderData = require('./orderDb.js');
var shoppingData = require('./shoppingList.js');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


app.post('/enquireOrder', function(req, res) {  
    var speech
      , openCounter = 0
      , intent = req.body.result && req.body.result.metadata.intentName ? req.body.result.metadata.intentName : "noIntent";
    if(intent === 'checkOrderStatus'){
      orderData.orderDb.forEach(function(element){
        if(element.status === 'open'){
          openCounter ++;
        }
      })
      if(openCounter == 0){
        speech = 'You have no open orders. Anything else I can help you with?'
      }
      else if(openCounter == 1){
        orderData.orderDb.forEach(function(element){
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
        orderData.orderDb.forEach(function(element){
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
        for(var i = 0; i < orderData.orderDb.length; i++){
          if(orderData.orderDb[i].status === 'open'){
            orderCounter++;
            if(orderCounter == orderNo){
              var deliveryTimeRem = (orderData.orderDb[i].deliveryTime - new Date())/60000;
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
        for(var i = 0; i < orderData.orderDb.length; i++){
          var tempOrderPlacementDate = orderData.orderDb[i].orderPlacementDate.toLowerCase()
          var tempOrderDateDay = orderDateDay.toLowerCase()
          var tempOrderDateMonth = orderDateMonth.toLowerCase()
          if((tempOrderPlacementDate.indexOf(tempOrderDateDay) !== -1) && (tempOrderPlacementDate.indexOf(tempOrderDateMonth) !== -1)){
            var deliveryTimeRem = (orderData.orderDb[i].deliveryTime - new Date())/60000;
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
        
        for(var i = 0; i < orderData.orderDb.length; i++){
          if(orderDb[i].value === orderCost){
            var deliveryTimeRem = (orderData.orderDb[i].deliveryTime - new Date())/60000;
            speech = 'It has left our store and will reach you in the next '
                      + Math.ceil(deliveryTimeRem) + ' minutes . Would you like me to help you with anything else?'
            break;
          }
        }
      }
    }
    
    else if(intent === 'changeRecurringOrderStatus'){
      var shoppingListName = req.body.result.parameters.recurTime ? req.body.result.parameters.recurTime : 'noShoppingListName'
      var shoppingStatus = req.body.result.parameters.recurStatus ? req.body.result.parameters.recurStatus : 'noShoppingStatus'
      if(shoppingListName === 'noShoppingListName'){
        speech = 'Sorry! No such list exists. Something else I can help you with?'
      }
      else{
        if(shoppingStatus === 'noShoppingStatus'){
          speech = 'No a valid status. Please provide a valid status.'
        }
        else{
          if(shoppingStatus === 'hold' ||shoppingStatus === 'pause' || shoppingStatus === 'stop'){
            shoppingData.shoppingList[shoppingListName].status = 'hold'
            var tempList = shoppingListName.charAt(0).toUpperCase() + shoppingListName.slice(1)
            speech = "Sure. '" + tempList +  "' shopping list has been put on hold."
          }
          else if(shoppingStatus === 'resume' ||shoppingStatus === 'start' || shoppingStatus === 'restart'){
            shoppingData.shoppingList[shoppingListName].status = 'resume'
            var tempList = shoppingListName.charAt(0).toUpperCase() + shoppingListName.slice(1)
            var randomNum = Math.floor((Math.random() * 20)/2);
            //console.log('randomNum :',randomNum);
            if(randomNum % 2 == 0){
              console.log('Even');
              var productNameString = ''
              for (var product in openNotificationsData.openNotifications) {
                if (openNotificationsData.openNotifications.hasOwnProperty(product)) {
                  openNotificationsData.openNotifications[product].forEach(function(element){
                    productNameString = productNameString + element.productName + ', ';
                  })
                }
              }
              productNameString = productNameString.slice(0, -2);
              var tempIndex = productNameString.lastIndexOf(',');
              var newProductNameString = productNameString.substr(0, tempIndex) + ' &' + productNameString.substr(tempIndex+1, productNameString.length);
              speech = "Sure. '" + tempList +  "' shopping list has been put on resume. Also '" + newProductNameString
                       + "' is back in stock. Would you like to add that to your weekly list?"
            }
            else{
              console.log('Odd');
              speech = "Sure. '" + tempList +  "' shopping list has been put on resume."
            }
          }
          else{
            speech = 'No a valid status. Please provide a valid status.'
          }
        }
      }
    }
    
    else if(intent === 'updateShoppingList'){
      var productQuantity = req.body.result.parameters.productQuantity ? parseInt(wordsToNumbers(req.body.result.parameters.productQuantity))  : 'noProductQuantity'
      var shoppingListName = req.body.result.contexts.parameters.recurTime ? req.body.result.contexts.parameters.recurTime : 'noShoppingListName'
      if(productQuantity === 'noProductQuantity' || shoppingListName === 'noShoppingListName'){
        speech = 'Sorry! Please provide proper Product Quantity and Shopping List Name'
      }
      else{
        speech = "'Single quantity of Ainsley Harriott Sumdried Tomato & Garlic Cous 100 grams' added to the weekly list. Anything else I can help you with."
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
