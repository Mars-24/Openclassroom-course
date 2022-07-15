const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const stuffCtrl = require('../controllers/stuff');
const multer = require('../middleware/multer-config');

router.post('/', auth, multer, stuffCtrl.createThing);
router.get('/', auth, stuffCtrl.getAllStuff);
router.get('/:id', auth, stuffCtrl.getOneThing);
router.put('/:id', auth, multer, stuffCtrl.modifyThing);
router.delete('/:id', auth, stuffCtrl.deleteThing);

module.exports = router;