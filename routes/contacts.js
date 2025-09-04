const express = require('express');
const Contact = require('../models/Contact');
const { checkFeature } = require('../middleware/featureAuth');
const router = express.Router();

// GET /api/contacts - Get all contact messages
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.findAll();
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching contacts', error: error.message });
  }
});

// GET /api/contacts/:id - Get contact message by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);
    
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }
    
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching contact', error: error.message });
  }
});

// POST /api/contacts - Create new contact message
router.post('/', checkFeature('write'), async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields (name, email, subject, message) are required' 
      });
    }
    
    const contactId = await Contact.create({ name, email, subject, message });
    const newContact = await Contact.findById(contactId);
    
    // Emitir evento en tiempo real a todos los clientes conectados
    const io = req.app.get('io') || global.io;
    console.log('🔍 Debug Socket.IO:', {
      hasIO: !!io,
      ioFromApp: !!req.app.get('io'),
      globalIO: !!global.io,
      project: req.project?.name || 'Unknown'
    });
    
    if (io) {
      const eventData = {
        success: true,
        data: newContact,
        message: 'Nuevo mensaje de contacto recibido',
        timestamp: new Date().toISOString(),
        project: req.project?.name || 'Unknown'
      };
      
      console.log('📡 Emitiendo evento new-contact:', eventData);
      io.to('contacts-room').emit('new-contact', eventData);
      console.log('✅ Evento new-contact emitido exitosamente');
    } else {
      console.log('❌ Socket.IO no disponible - no se puede emitir evento');
    }
    
    res.status(201).json({ success: true, data: newContact, message: 'Contact message created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating contact', error: error.message });
  }
});

// PUT /api/contacts/:id - Update contact message
router.put('/:id', checkFeature('write'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, subject, message } = req.body;
    
    // Check if contact exists
    const existingContact = await Contact.findById(id);
    if (!existingContact) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }
    
    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields (name, email, subject, message) are required' 
      });
    }
    
    const updated = await Contact.update(id, { name, email, subject, message });
    
    if (updated) {
      const updatedContact = await Contact.findById(id);
      res.json({ success: true, data: updatedContact, message: 'Contact message updated successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update contact message' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating contact', error: error.message });
  }
});

// DELETE /api/contacts/:id - Delete contact message
router.delete('/:id', checkFeature('delete'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if contact exists
    const existingContact = await Contact.findById(id);
    if (!existingContact) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }
    
    const deleted = await Contact.delete(id);
    
    if (deleted) {
      // Emitir evento en tiempo real
      const io = req.app.get('io') || global.io;
      if (io) {
        io.to('contacts-room').emit('contact-deleted', {
          success: true,
          contactId: id,
          message: 'Mensaje de contacto eliminado',
          timestamp: new Date().toISOString(),
          project: req.project?.name || 'Unknown'
        });
      }
      
      res.json({ success: true, message: 'Contact message deleted successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to delete contact message' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting contact', error: error.message });
  }
});

// GET /api/contacts/email/:email - Get messages by email
router.get('/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const contacts = await Contact.findByEmail(email);
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching contacts by email', error: error.message });
  }
});

module.exports = router;
