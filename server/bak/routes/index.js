const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
	res.send({ response: "Connected" }).status(200);
});

module.exports = router;
