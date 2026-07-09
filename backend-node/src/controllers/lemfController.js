const LemfModel = require('../models/lemfModel');

exports.list = async (req, res, next) => {
  try {
    const records = await LemfModel.findAll();
    res.json(records);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, category, assignedTo, notes, status } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }

    const saved = await LemfModel.create({
      name: name.trim(),
      category: category || null,
      assignedTo: assignedTo || null,
      notes: notes || null,
      status: status && status.trim() !== '' ? status.trim() : 'PENDING',
      createdBy: req.user ? req.user.id : null
    });

    res.json(saved);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, assignedTo, notes, status } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }

    const updated = await LemfModel.update(id, {
      name: name.trim(),
      category: category || null,
      assignedTo: assignedTo || null,
      notes: notes || null,
      status: status && status.trim() !== '' ? status.trim() : 'PENDING'
    });

    if (!updated) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await LemfModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    next(err);
  }
};
