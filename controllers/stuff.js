const { JsonWebTokenError } = require('jsonwebtoken');
const Thing = require('../models/Thing');
const fs = require('fs');

exports.createThing = (req, res) => {
    const thingObjet = JSON.parse(req.body.thing);
    delete thingObjet._id;
    delete thingObjet._userId;
    const thing = new Thing({
        ...thingObjet,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    thing.save().then(() => { res.status(201).json({ message: 'Objet creer' }) }).catch(err => res.status(401).json({ err }))
};

exports.getAllStuff = (req, res, next) => {
    Thing.find().then((things) => res.status(200).json(things)).catch(err => res.status(500).json({ err }))
};

exports.getOneThing = (req, res, next) => {
    const id = req.params.id;
    Thing.findOne({ _id: id }).then(thing => res.status(200).json(thing)).catch(err => res.status(404).json({ err }))
};

exports.modifyThing = (req, res) => {
    const thingObject = req.file ? {
        ...JSON.parse(req.body.thing), imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.name}`
    } : { ...req.body };
    delete thingObject._userId;
    Thing.findOne({ _id: req.params.id }).then(thing => {
        if (thing.userId != req.auth.userId) {
            res.status(401).json({ message: 'Non-Autorisé' });
        } else {
            Thing.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id }).then(() => { res.status(200).json({ message: 'Objet modifié!' }) }).catch(err => res.status(401).json({ err }))
        }
    }).catch(err => res.status(400).json({ err }))
};

exports.deleteThing = (req, res, next) => {
    Thing.findOne({ _id: req.params.id })
        .then(thing => {
            if (thing.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = thing.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Thing.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};