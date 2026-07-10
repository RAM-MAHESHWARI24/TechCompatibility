const LemfModel = require('../models/lemfModel');

exports.list = async (req, res, next) => {
  try {
    console.log('Fetching all LEMF records.');
    const records = await LemfModel.findAll();
    res.json(records);
  } catch (err) {
    console.error('Error fetching LEMF records:', err);
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, category, assignedTo, notes, status } = req.body;
    const creator = req.user ? req.user.username : 'anonymous';
    console.log(`Attempting to add new LEMF record. User: "${creator}". Data:`, { name, category, assignedTo, status });

    if (!name || name.trim() === '') {
      console.warn('LEMF record creation failed: Name is empty.');
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

    console.log(`Successfully created LEMF record with ID ${saved.id}. Name: "${saved.name}".`);
    res.json(saved);
  } catch (err) {
    console.error('Error creating LEMF record:', err);
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, assignedTo, notes, status } = req.body;
    const editor = req.user ? req.user.username : 'anonymous';
    console.log(`Attempting to update LEMF record ID ${id}. User: "${editor}". Data:`, { name, category, assignedTo, status });

    if (!name || name.trim() === '') {
      console.warn(`LEMF record update failed for ID ${id}: Name is empty.`);
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
      console.warn(`LEMF record update failed: Record ID ${id} not found.`);
      return res.status(404).json({ error: 'Record not found' });
    }

    console.log(`Successfully updated LEMF record ID ${id}. Name: "${updated.name}".`);
    res.json(updated);
  } catch (err) {
    console.error(`Error updating LEMF record ID ${id}:`, err);
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleter = req.user ? req.user.username : 'anonymous';
    console.log(`Attempting to delete LEMF record ID ${id}. User: "${deleter}".`);

    const deleted = await LemfModel.delete(id);
    if (!deleted) {
      console.warn(`LEMF record deletion failed: Record ID ${id} not found.`);
      return res.status(404).json({ error: 'Record not found' });
    }

    console.log(`Successfully deleted LEMF record ID ${id}.`);
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error(`Error deleting LEMF record ID ${id}:`, err);
    next(err);
  }
};
