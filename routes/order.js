const express = require("express");
const orderModel= require("../models/orderModel");
const Users = require("../models/userModel");
const moment = require('moment');




const orderRoute = express.Router();
const mySort = {   
    total_price:1, 
    created_at :1
  };





// only users who's details(username && password) are stored in
//can create an order
orderRoute.post('/',  async (req, res) => {
   // the params are user ID , username and password for authentication
   
    const body = req.body;

    const total_price = body.items.reduce((prev, curr) => {
        prev += curr.price
        return prev
    }, 0);

    const order = await orderModel.create({ 
        items: body.items,
        created_at: moment().toDate(),
        total_price
    })
    
    return res.json({ status: true, order })
})

orderRoute.get('/:orderId',  async (req, res) => {
    const { orderId } = req.params;
    const order = await orderModel.findById(orderId)

    if (!order) {
        return res.status(404).json({ status: false, order: null })
    }

    return res.json({ status: true, order })
})


orderRoute.get('/', async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page-1)*limit;
    const endIndex = page * limit


    const orders = await orderModel.find().sort(mySort).limit(limit).skip(startIndex);
//paging the GET all orders (2 document per page) 
    return res.json({ status: true, orders })
})

orderRoute.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { state } = req.body;

    const order = await orderModel.findById(id)

    if (!order) {
        return res.status(404).json({ status: false, order: null })
    }

    if (state < order.state) {
        return res.status(422).json({ status: false, order: null, message: 'Invalid operation' })
    }

    order.state = state;

    await order.save()

    return res.json({ status: true, order })
})

orderRoute.delete('/:id',async (req, res) => {
    const { id } = req.params;

    const order = await orderModel.deleteOne({ _id: id})

    return res.json({ status: true, order })
})

module.exports = orderRoute