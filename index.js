const dotenv = require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const crypto = require('crypto');
const cookie = require('cookie');
const nonce = require('nonce')();
const querystring = require('querystring');
const request = require('request-promise');
const PORT = process.env.PORT || 5000;

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const scopes = 'read_products';
//const forwardingAddress = "http://34c6f6f2.ngrok.io"; // Replace this with your HTTPS Forwarding address

const shopifyAPI = require('shopify-node-api'); 
const _ = require('lodash');
 
var Shopify = new shopifyAPI({
  shop: 'dev-vsat.myshopify.com', // MYSHOP.myshopify.com 
  shopify_api_key: 'f37c3a491d60c332598f3bb451e8e27c', // Your API key 
  access_token: '346106ad261699c034df8c6c733a5428' // Your API password 
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Endpoint to update Orders with tags
app.get('/addOrderTags', function(req, res) {
	var result = 'Updated tags for Orders: ';
	var count = 0;

  Shopify.get('/admin/orders.json?fields=note_attributes,id', function(err, data, headers) {
  	var orders = data.orders;
  	_.each(orders, function(order, index) {
  	  addTags(order, function() {
  	  	result += '<br/>#' + order.id;

  	  	count++;
  	  	if (count == orders.length) {
			  	res.send(result);
  	  	}
  	  });
  	});
  });
});

function addTags(order, callback) {
	var orderUpdate = {
	  "order": {
	  	"id": order.id
	  }
	};

	// Check if delivery and timeslot attributes exist on order
	var delivery = _.filter(order.note_attributes, function(o) {return o.name == 'delivery'});
	var tags = [];
	if (delivery.length) {
		tags.push(delivery[0].value);
	}

	if (tags.length) {
		orderUpdate.order['tags'] = tags.join();
	}

	Shopify.put('/admin/orders/' + order.id + '.json', orderUpdate, function(err, data, headers) {
		if (err) {
			console.log(err);
		}

	  if (!_.isUndefined(callback)) {
	  	callback();
	  }
	});
}

/*
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.post('/p', function(req, res) {
  console.log(req.body);
  res.send(req.body);
});

Shopify.get('/admin/orders.json', function(err, data, headers){
  //console.log(data.orders.length); // Data contains product json information 
});
*/

app.listen(PORT, () => {
  console.log('App listening on port: ' + PORT);
});