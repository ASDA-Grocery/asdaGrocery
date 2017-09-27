'use strict';

const express = require('express')
    , bodyParser = require('body-parser')
    , { wordsToNumbers } = require('words-to-numbers')
    , app = express();

var orderData = require('./orderDb.js')
  , shoppingData = require('./shoppingList.js')
  , openNotificationsData = require('./openNotifications.js');

const google = require('googleapis')
    , calendar = google.calendar('v3')
    , OAuth2 = google.auth.OAuth2
    , clientId = '357369265143-8j0kor1bbl87h7houkt5qbt76r9keg5l.apps.googleusercontent.com'
    , clientSecret = 'E047ajWFZ5MiobPR_7WRrvXx'
    , redirect = 'https://oauth-redirect.googleusercontent.com/r/groceryapp-b4d9c'
    , oauth2Client = new OAuth2(clientId, clientSecret, redirect);

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


app.post('/enquireOrder', function(req, res) {  
    
    var speech
      , openCounter = 0
      , intent = req.body.result && req.body.result.metadata.intentName ? req.body.result.metadata.intentName : "noIntent"
      , accessToken = req.body.originalRequest.data.user.accessToken ? req.body.originalRequest.data.user.accessToken : 'noAccessToken';
    console.log('intent :',intent);
    if(accessToken === 'noAccessToken'){
        speech = 'Please Login to you google account';
    }
//     if(1 == 2){
//         speech = 'Please Login to you google account';
//     }
    else {
        oauth2Client.setCredentials({
          access_token:accessToken
        });
    
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
              if(orderData.orderDb[i].value === orderCost){
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
          if(typeof shoppingListName === 'object'){
            console.log('Shopping list name came as object')
            var tempName = shoppingListName[0]
            shoppingListName = tempName
          }
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
                shoppingData.shoppingList[shoppingListName].status = 'active'
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
                  var newProductNameString = productNameString.substr(0, tempIndex) + productNameString.substr(tempIndex+1, productNameString.length);
                  speech = "Sure. '" + tempList +  "' shopping list is now active. Also '" + newProductNameString
                           + "' is back in stock. Would you like to add that to your weekly list?"
                }
                else{
                  console.log('Odd');
                  speech = "Sure. '" + tempList +  "' shopping list is now active."
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
          var shoppingListName = req.body.result.contexts[0].parameters.recurTime ? req.body.result.contexts[0].parameters.recurTime : 'noShoppingListName'
          if(productQuantity === 'noProductQuantity' || shoppingListName === 'noShoppingListName'){
            speech = 'Sorry! Please provide proper Product Quantity and Shopping List Name'
          }
          else{
            if(!(shoppingListName in shoppingData.shoppingList)){
              speech = 'Please provide correct Shopping List Name'
            }
            else{
              var productNameString = ''
              for (var product in openNotificationsData.openNotifications) {
                if (openNotificationsData.openNotifications.hasOwnProperty(product)) {
                  openNotificationsData.openNotifications[product].forEach(function(element){
                    var newProduct = {
                      productId: element.productId,
                      productName: element.productName,
                      quantity: productQuantity
                    }
                    shoppingData.shoppingList[shoppingListName].productList.push(newProduct)
                    productNameString = productNameString + element.productName + ', ';
                  })
                }
              }
              productNameString = productNameString.slice(0, -2);
              if(productQuantity == 1){
                speech = "'Single' quantity of " + productNameString + " added to the weekly list. Anything else I can help you with?"
              }
              else{
                speech = productQuantity + " quantities of " + productNameString + " added to the weekly list. Anything else I can help you with?"
              }
            }
          }
        }
        
        else if(intent === 'changeContextOrderStatus'){
          var shoppingListName = req.body.result.contexts[0].parameters.recurTime ? req.body.result.contexts[0].parameters.recurTime : 'noShoppingListName'
          var shoppingStatus = req.body.result.parameters.recurStatus ? req.body.result.parameters.recurStatus : 'noShoppingStatus'
          if(shoppingStatus === 'noShoppingStatus' || shoppingListName === 'noShoppingListName'){
            speech = 'Please provide a valid Shopping List Name/Status.'
            console.log('Shopping List Name :', shoppingListName);
            console.log('Shopping Status :', shoppingStatus);
          }
          else{
            if(!(shoppingListName in shoppingData.shoppingList)){
              speech = 'Please provide correct Shopping List Name'
            }
            else{
              if(shoppingStatus === 'hold' ||shoppingStatus === 'pause' || shoppingStatus === 'stop'){
                shoppingData.shoppingList[shoppingListName].status = 'hold'
                var tempList = shoppingListName.charAt(0).toUpperCase() + shoppingListName.slice(1)
                speech = "Sure. '" + tempList +  "' shopping list has been put on hold."
              }
              else{
                shoppingData.shoppingList[shoppingListName].status = 'active'
                var tempList = shoppingListName.charAt(0).toUpperCase() + shoppingListName.slice(1)
                speech = "Sure. '" + tempList +  "' shopping list has been put on active."
              }
            }
          }
        }

        else if(intent === 'changeDeliveryDate'){
            console.log('intent - > ', intent);
            console.log('oauth - > ', oauth2Client);
            var start , end, summary = '';
            var flag = false;
            calendar.events.list({
                auth: oauth2Client,
                calendarId: 'primary',
                timeMin: (new Date()).toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime'
            }, function(err, response) {
                if (err) {
                  console.log('The Calendar API returned an error: ' + err);
                  return;
                }
                var events = response.items;
                console.log('events - > ', events);
                if (events.length == 0) {
                  console.log('No upcoming events found.');
                } else {
                  console.log('Upcoming 10 events:');
                  for (var i = 0; i < events.length; i++) {
                    var event = events[i];
                    start = event.start.dateTime || event.start.date;
                    end = event.end.dateTime || event.end.date;
                    summary = event.summary;
                    flag = true;
                    console.log(start,' - ',summary);
                  }
                }
            });
            if(flag){
                speech = 'As per your Google Calendar, you have '+event.summary+' from 11.30 AM to 1.30 PM. Would you like to pay 3 Pounds extra for guaranteed delivery by tomorrow 9 AM?'                
                console.log('inside last if - > ',speech, intent);
            }
        }

        else{
          speech = 'Sorry! Unable to Understand'
        }
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
