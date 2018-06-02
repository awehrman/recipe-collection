const express = require('express');
const router = express.Router();

const ingredientController = require('../controllers/ingredientController');

router.get('/', (req, res, next) => {
	const ingredients = ingredientController.loadIngredients(true);
  res.json({ ingredients: ingredients });
});

router.get('/count', (req, res, next) => {
	const ingredients = ingredientController.loadIngredients(true);
  res.json({ count: ingredients.length });
});

router.get('/errors', (req, res, next) => {
	const errors = ingredientController.loadErrors();
  res.json({ errors: errors });
});

router.get('/errors/count', (req, res, next) => {
	const errors = ingredientController.loadErrors();

  res.json({
  	errors: {
  		data: errors.filter(e => e.type === 'data').length,
			parsing: errors.filter(e => e.type === 'parsing').length,
			semantic: errors.filter(e => e.type === 'semantic').length,
			total: errors.length
  	}
  });
});

module.exports = router;
