'use strict';

const express = require('express')
    , bodyParser = require('body-parser')
    , { wordsToNumbers } = require('words-to-numbers')
    , app = express();

var orderData = require('./orderDb.js')
  , shoppingData = require('./shoppingList.js')
  , productData = require('./productList.js')
  , customerData = require('./customerList.js')
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
    
    var speech = 'This is the default speech'
      , openCounter = 0
      , contextOut
      , intent = req.body.result && req.body.result.metadata.intentName ? req.body.result.metadata.intentName : "noIntent"
      , contexts =  req.body.result && req.body.result.contexts ? req.body.result.contexts : "noContexts"
//       , accessToken = req.body.originalRequest.data.user.accessToken ? req.body.originalRequest.data.user.accessToken : 'noAccessToken';

//     if(accessToken === 'noAccessToken'){
//         speech = 'Please Login to you google account';
//          responseToAPI(speech);
//     }
    if(1 == 2){
        speech = 'Please Login to you google account';
    }
    else {
//         oauth2Client.setCredentials({
//           access_token:accessToken
//         });
    
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
          responseToAPI(speech);
        }
        else if(intent === 'orderNo-status'){
          var orderNo = req.body.result.parameters.orderN ? parseInt(wordsToNumbers(req.body.result.parameters.orderN)) : 'noOrderNumber'
          if(orderNo === 'noOrderNumber'){
            speech = 'Sorry! Not able to help you this time. Do you want me to help you with anything else?'
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
                  if(orderNo === 2){
                    speech = 'It is yet to be shipped but will reach you on time. Anything else I can help you with?'
                  }
                  break;
                }
              }
            }
          }
          responseToAPI(speech);
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
          responseToAPI(speech);
        }
        else if(intent === 'orderCost-status'){
          var orderCost = req.body.result.parameters.orderCost ? req.body.result.parameters.orderCost : 'noOrderCost'
          if(orderCost === 'noOrderCost'){
            speech = 'Sorry! Not able to help you this time. Do you want me to help you with anything else?';
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
          responseToAPI(speech);
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
              else if(shoppingStatus === 'resume' ||shoppingStatus === 'start' || shoppingStatus === 'restart' || shoppingStatus === 'active' || shoppingStatus === 'continue' || shoppingStatus === 'recommence'){
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
                           + "' is back in stock. Would you like to add that to your "+ tempList + " list?"
                }
                else{
                  console.log('Odd');
                  speech = "Sure. '" + tempList +  "' shopping list is now active."
                }
              }
              else{
                speech = 'Not a valid status. Please provide a valid status.'
              }
            }
          }
          responseToAPI(speech);
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
          responseToAPI(speech);
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
                speech = "Sure. '" + tempList +  "' shopping list is now active."
              }
            }
          }
          responseToAPI(speech);
        }
        
        else if(intent === 'findProducts'){
          var mineralContent = req.body.result.parameters.mineralContent ? req.body.result.parameters.mineralContent : 'noMineralContent'
          var mineralType = req.body.result.parameters.mineralType ? req.body.result.parameters.mineralType : 'noMineralType'
          var productType = req.body.result.parameters.productType ? req.body.result.parameters.productType : 'noProductType'
          if(mineralType === 'noMineralType' || productType === 'noProductType' || mineralContent === 'noMineralContent'){
            speech = 'Please specify a proper product with proper details.'
          }
          else{
            var countObj = {}
              , keyArray = new Array();
            productData.productList.forEach(function(element){
              if(!(element[mineralType] in countObj)){
                var tempKey = element[mineralType]
                countObj[tempKey] = 1;
                keyArray.push(tempKey)
              }
              else{
                var tempKey = element[mineralType]
                var tempVal = countObj[tempKey]
                countObj[tempKey] = tempVal + 1;
              }
            })
            keyArray.sort(function(a,b){
              return a - b;
            });
            if(mineralContent === 'high'){
              speech = 'We have '+ countObj[keyArray[keyArray.length - 1]] + ' options with '
                        + keyArray[keyArray.length - 1] + ' grams and ' + countObj[keyArray[keyArray.length - 2]]
                        + ' options with ' + keyArray[keyArray.length - 2]+ ' grams in each bar.'
            }
            else if(mineralContent === 'low'){
              speech = 'We have '+ countObj[keyArray[0]] + ' options with '
                        + keyArray[0] + ' grams and ' + countObj[keyArray[1]]
                        + ' options with ' + keyArray[1] + ' grams in each bar.'
            }
            else{
              speech = 'Sorry this level of content is not available.'
            }
          }
          responseToAPI(speech);
        }
        
        else if(intent === 'optionsFindProduct'){
          var index = req.body.result.contexts.findIndex((x) => x.name === 'searchproduct')
          console.log('index ------> ',index);
          var mineralValue = req.body.result.parameters.number ? req.body.result.parameters.number : 'noMineralValue'
          var mineralType = req.body.result.contexts[index].parameters.mineralType ? req.body.result.contexts[index].parameters.mineralType : 'noMineralType'
          if(mineralType === 'noMineralType'){
            speech = 'No mineralType context'
          }
          else{
            speech = ''
            if(mineralValue != 'noMineralValue'){
              productData.productList.forEach(function(element){
                if(element[mineralType] == mineralValue){
                  speech = speech + element.productName + ', '
                }
              })
              speech = speech.slice(0,-2)
              var tempIndex = speech.lastIndexOf(',')
              if(tempIndex != -1){
                var tempSpeech = speech.substr(0, tempIndex) + ' &' + speech.substr(tempIndex+1, speech.length-1)
                speech = tempSpeech
                contextOut = [{"name":"initialcontent", "lifespan":5, "parameters":{'initialMineralType': mineralType}}]
              }
            }
          }
          responseToAPI(speech);
        }
        
        else if(intent === 'findSpecificContentProduct'){
          console.log('inside findSpecificContentProduct')
          console.log('checking contexts: ', req.body.result.contexts)
          var index = req.body.result.contexts.findIndex((x) => x.name === 'searchproduct')
          var initialIndex = req.body.result.contexts.findIndex((x) => x.name === 'initialcontent')
          var mineralValue = req.body.result.contexts[index].parameters.number ? parseInt(req.body.result.contexts[index].parameters.number) : 'noMineralValue'
          var mineralType = req.body.result.parameters.mineralType ? req.body.result.parameters.mineralType : 'noMineralType'
          var initialMineralType = req.body.result.contexts[initialIndex].parameters.initialMineralType ? req.body.result.contexts[initialIndex].parameters.initialMineralType : 'noInitialMineralType'
          var mineralContent = req.body.result.parameters.mineralContent ? req.body.result.parameters.mineralContent : 'noMineralContent'
          console.log('Mineral Value:', mineralValue)
          console.log('Mineral Type:', mineralType)
          console.log('Initial Mineral Type:', initialMineralType)
          console.log('Mineral Content:', mineralContent)
          if(mineralValue === 'noMineralValue'){
            speech = 'No mineralValue context'
          }
          else{
            speech = ''
            var contentLevel = -1
              , productName
              , totalProducts = productData.productList.length;
            productData.productList.forEach(function(element){
              if(mineralContent === 'low' || mineralContent === 'lower'){
                console.log('element initial mineral type: ', element[initialMineralType])
                console.log('typeof initial mineral value : ', typeof element[initialMineralType])
                console.log('typeof mineral value : ', typeof mineralValue)
                if(element[initialMineralType] === mineralValue){
                  console.log('inside if dsyfdysf')
                  if(element[mineralType] < contentLevel || contentLevel < 0){
                    contentLevel = element[mineralType]
                    productName = element.productName;
                    console.log('ping')
                  }
                  else{
                    console.log('pong')
                  }
                }
                else{
                  console.log('pongsdhfgsdyu')
                }
              }
              else if(mineralContent === 'high' || mineralContent === 'higher' || mineralContent === 'good'){
                if(element[initialMineralType] === mineralValue){
                  if(contentLevel < 0 || element[mineralType] > contentLevel){
                    contentLevel = element[mineralType]
                    productName = element.productName;
                  }
                }
              }
            })
            speech = productName;
            contextOut = [{"name":"addproductcart", "lifespan":5, "parameters":{'productName': productName}}]
          }
          responseToAPI(speech);
        }
        
        else if(intent === 'addToCart&Checkout'){
          var index = req.body.result.contexts.findIndex((x) => x.name === 'addproductcart')
          var number = req.body.result.parameters.number ? req.body.result.parameters.number : 'noNumberIntegerValue'
          var productName = req.body.result.contexts[index].parameters.productName ? req.body.result.contexts[index].parameters.productName : 'noProductName'
          var checkoutBool = req.body.result.contexts[index].parameters.checkout ? req.body.result.contexts[index].parameters.checkout : 'noCheckout'
          
          if(checkoutBool === 'noCheckout' || checkoutBool === ''){
            var prodIndex = productData.productList.findIndex((x) => x.productName === productName)
            var product = {
              productId: productData.productList[prodIndex].productId,
              productName: productName,
              quantity: number
            }
            shoppingData.shoppingList.cart.productList.push(product)
            console.log(shoppingData.shoppingList.cart.productList);
            speech = number + ' ' + productName + ' added to the cart. Do you want to proceed to checkout?'
          }
          else{
            var prodIndex = productData.productList.findIndex((x) => x.productName === productName)
            var product = {
              productId: productData.productList[prodIndex].productId,
              productName: productName,
              quantity: number
            }
            shoppingData.shoppingList.cart.productList.push(product)
            speech = number + ' ' + productName + ' added to the cart & checkout.'
          }
          responseToAPI(speech)
        }
        
        else if(intent === 'checkoutAfterConfirmation'){
          var negativeConfirmation = req.body.result.parameters.negativeConfirmation ? req.body.result.parameters.negativeConfirmationr : 'noNegativeConfirmation'
          var positiveConfirmation = req.body.result.parameters.positiveConfirmation ? req.body.result.parameters.positiveConfirmation : 'noPositiveConfirmation'
          if(negativeConfirmation === 'noNegativeConfirmation'){
            speech = 'Sure. Checkout Done'
          }
          else{
            speech = 'Alright. Is there anything else I can help now?'
          }
          responseToAPI(speech);  
        }
        

//         else if(intent === 'postponeDelivery'){
//             var start , end, summary = '';
//             var flag = false;
//             var index = req.body.result.contexts.findIndex((x) => x.name === 'postponeDelivery')
//             calendar.events.list({
//                 auth: oauth2Client,
//                 calendarId: 'primary',
//                 timeMin: (new Date()).toISOString(),
//                 maxResults: 10,
//                 singleEvents: true,
//                 orderBy: 'startTime'
//             }, function(err, response) {
//                 if (err) {
//                   console.log('The Calendar API returned an error: ' + err);
//                   return;
//                 }
//                 var events = response.items;
//                 if (events.length == 0) {
//                   console.log('No upcoming events found.');
//                   console.log('param - > ', req.body.result.parameters.postponeTime);
//                   speech = 'Your order delivery is postponed as per you requested!'
//                   responseToAPI(speech);
//                 } else {
//                   console.log('Upcoming 10 events:');
//                   for (var i = 0; i < 1; i++) {
//                     var event = events[i]
//                       , start = event.start.dateTime || event.start.date
//                       , end = event.end.dateTime || event.end.date  
//                       , sDate = new Date(start)
//                       , eDate = new Date(end)
//                       , summary = event.summary;
//                     flag = true;
//                     sDate.setHours(sDate.getHours()+5);
//                     sDate.setMinutes(sDate.getMinutes()+30);
//                     eDate.setHours(eDate.getHours()+5);
//                     eDate.setMinutes(eDate.getMinutes()+30);
//                     var noonDate = new Date();
//                     noonDate.setDate(noonDate.getDate()+1);
//                     noonDate.setHours(12);
//                     noonDate.setMinutes(0);
//                     noonDate.setSeconds(0);
//                     noonDate.setMilliseconds(0);
//                     console.log('check noon date _ > ', noonDate, typeof(noonDate),sDate, typeof(sDate),eDate);
//                     var startTime = sDate.toLocaleTimeString()
//                       , endTime = eDate.toLocaleTimeString();
//                     if(req.body.result.parameters.timeSlabOccurance=='before'||req.body.result.parameters.timeSlab1=='noon'||req.body.result.parameters.timeSlab1=='morning'){
//                         console.log('1ST IF -- > ');
//                         if(sDate<=noonDate){
//                             console.log('2ND IF -- >');
//                             speech = 'As per your Google Calendar, you have '+event.summary+' from '+startTime+' to '+endTime+'. Would you like to pay 3 Pounds extra for guaranteed delivery by tomorrow 9 AM?'                
//                             responseToAPI(speech);
//                         }
//                         else if(sDate>noonDate){
//                             speech = 'Are you sure you want your shopping list delivered by tomorrow 3 PM?'                
//                             responseToAPI(speech);
//                         }
//                         else{
//                             speech = 'As per your Google Calendar, you have '+event.summary+' from '+startTime+' to '+endTime+'. Would you like to pay 3 Pounds extra for guaranteed delivery by tomorrow 9 AM?'                
//                             responseToAPI(speech);
//                         }
//                     }
//                     else {
//                          if(sDate<=noonDate){
//                             console.log('2ND IF -- >');
//                             speech = 'Are you sure you want your shopping list delivered by tomorrow 3 PM?'                
//                             responseToAPI(speech);
//                         }
//                         else if(sDate>noonDate){
//                             speech = 'As per your Google Calendar, you have '+event.summary+' from '+startTime+' to '+endTime+'. Would you like to pay 3 Pounds extra for guaranteed delivery by tomorrow 12 noon?'                
//                             responseToAPI(speech);
//                         }
//                         else{
//                             speech = 'Are you sure you want your shopping list delivered by tomorrow 3 PM?'                
//                             responseToAPI(speech);
//                         }
//                     }
// //                     if(flag){
// //                         speech = 'As per your Google Calendar, you have '+event.summary+' from '+startTime+' to '+endTime+'. Would you like to pay 3 Pounds extra for guaranteed delivery by tomorrow 9 AM?'                
// //                         console.log('inside last if - > ',speech, intent);
// //                         console.log('param - > ', req.body.result.parameters.postponeTime);
// //                         responseToAPI(speech);
// //                     }
//                   }
//                 }
//             });
            
//         }
        
//         else if(intent === 'confirmDeliveryPostpone'){
//            var index = req.body.result.contexts.findIndex((x) => x.name === 'confirmpostpone')
//            var shoppingListName = req.body.result.contexts[index].parameters.recurTime ? req.body.result.contexts[index].parameters.recurTime : 'noShoppingList'
//              , postponeTime = req.body.result.contexts[index].parameters.postponeTime ? req.body.result.contexts[index].parameters.postponeTime : 'noPostponeTime' ;
//             console.log(' sdgugusdgu :', req.body.result)
//             console.log(' - > ',req.body.result.contexts[index].parameters.recurTime, req.body.result.contexts[index].parameters.postponeTime);
//            if(shoppingListName === 'noShoppingList' || postponeTime === 'noPostponeTime'){
//               speech = 'Sorry, unable to understand list name to be postponed';
//            }
//            else {
//               if(postponeTime === 'tomorrow' || postponeTime === 'Tomorrow'){
//                 var list = shoppingData.shoppingList['weekly'];
//                 var Id = (orderData.orderDb.length + 1).toString();
//                 var date = new Date();
//                 var orderObj = {
//                     orderId: 'OR10000'+Id,
//                     productList: list.productList,
//                     orderPlacementDate: 'June 23, 2017',
//                     value: '20 £',
//                     status: 'closed',
//                     deliveryTime: date
//                  };
//                  orderData.orderDb.push(orderObj);
//                  console.log('new postponed order - > ', orderData.orderDb);
//                  speech = 'Your order has been placed successfully';
//                }
//             }
//             responseToAPI(speech);
//           }
        

//         else{
//           speech = 'Sorry! Unable to Understand'
//           responseToAPI(speech)
//         }
//     }
    
    //var tempData = req.query;
    function responseToAPI(speech){
        return res.json({
            speech: speech,
            displayText: speech,
            source: 'webhook-asda-assistant',
            contextOut: contextOut
        });
    }
    
});

app.listen((process.env.PORT || 8000), function() {
    console.log("Server up and listening");
});
