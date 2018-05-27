const express = require('express');
const router = express.Router();

const Ingredient = require('../models/ingredientModel');

// TODO
router.get('/', (req, res, next) => {
	console.log('GET: /');
	let ing = new Ingredient('potato');
	console.log(ing.name);

  res.json(ing.name);
});

module.exports = router;
