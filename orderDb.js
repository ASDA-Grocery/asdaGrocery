function getOrderTime(diff){
  var currentDate = new Date()
  currentDate.setTime(currentDate.getTime() + (diff*60000));
  return currentDate;
}

exports.orderDb = [
  {
    orderId: 'OR100001',
    userID: 'AKLBYN2NLw64ag8B3SnLUN8ks7Jq'
    productList: [
      {
        productId: 'PR100001',
        productName: 'product1',
        quantity: '2'
      }
    ],
    orderPlacementDate: 'December 27, 2017',
    value: '20 £',
    status: 'closed',
    shipped: 'false',
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
    orderPlacementDate: 'December 28, 2017',
    value: '35 £',
    status: 'closed',
    shipped: 'false',
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
    orderPlacementDate: 'December 29, 2017',
    value: '15 £',
    status: 'closed',
    shipped: 'false',
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
    orderPlacementDate: 'December 30, 2017',
    value: '40 £',
    status: 'open',
    shipped: 'true',
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
    orderPlacementDate: 'December 31, 2017',
    value: '90 £',
    status: 'open',
    shipped: 'false',
    deliveryTime: getOrderTime(50)
  },
  {
    orderId: 'OR100001',
    userID: 'AKLBYN2NLw64ag8B3SnLUN8ks7Jq'
    productList: [
      {
        productId: 'PR100001',
        productName: 'product1',
        quantity: '2'
      }
    ],
    orderPlacementDate: 'December 27, 2017',
    value: '20 £',
    status: 'closed',
    shipped: 'false',
    deliveryTime: getOrderTime(30)
  },
  {
    orderId: 'OR100006',
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
    orderPlacementDate: 'December 28, 2017',
    value: '35 £',
    status: 'closed',
    shipped: 'false',
    deliveryTime: getOrderTime(40)
  },
  {
    orderId: 'OR100007',
    productList: [
      {
        productId: 'PR100002',
        productName: 'product2',
        quantity: '3'
      }
    ],
    orderPlacementDate: 'December 29, 2017',
    value: '15 £',
    status: 'closed',
    shipped: 'false',
    deliveryTime: getOrderTime(25)
  },
  {
    orderId: 'OR100008',
    productList: [
      {
        productId: 'PR100001',
        productName: 'product1',
        quantity: '4'
      }
    ],
    orderPlacementDate: 'December 30, 2017',
    value: '40 £',
    status: 'open',
    shipped: 'true',
    deliveryTime: getOrderTime(30)
  },
  {
    orderId: 'OR100009',
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
    orderPlacementDate: 'December 31, 2017',
    value: '90 £',
    status: 'open',
    shipped: 'false',
    deliveryTime: getOrderTime(50)
  }
]
