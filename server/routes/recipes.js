const express = require('express');
const router = express.Router();

const recipeController = require('../controllers/recipeController');

router.get('/', (req, res, next) => {
	const recipes = recipeController.loadRecipes(true);
  res.json({ recipes: recipes });
});

router.get('/count', (req, res, next) => {
	const recipes = recipeController.loadRecipes(true);
  res.json({ count: recipes.length });
});

router.get('/ingredientLines', (req, res, next) => {
	const recipes = recipeController.loadRecipes(true);

	let lines = recipes.map(rp => rp.ingredientLines.map(l => { return { reference: l.reference, isParsed: l.isParsed } }));
  lines = [].concat(...lines);
  res.json({ ingredientLines: lines });
});

router.get('/ingredientLines/count', (req, res, next) => {
	const recipes = recipeController.loadRecipes(true);
	
	let lines = recipes.map(rp => rp.ingredientLines.map(l => { return { reference: l.reference, isParsed: l.isParsed } }));
  lines = [].concat(...lines);

  res.json({ count: lines.length });
});

module.exports = router;

