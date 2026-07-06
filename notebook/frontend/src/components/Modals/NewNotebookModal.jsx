import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const COLORS = ['#FF69B4','#E91E8C','#FF1493','#FF6EB4','#FFB6C1',
                '#9C27B0','#673AB7','#3F51B5','#2196F3','#00BCD4',
                '#4CAF50','#8BC34A','#FFEB3B','#FF9800','#FF5722'];

export default function NewNotebookModal({ show, onHide, onCreate }) {
  const [name, setName]         = useState('');
  const [colorTag, setColorTag] = useState('#FF69B4');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreate(name.trim(), colorTag);
    setName(''); setColorTag('#FF69B4');
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton style={{ background: 'var(--nb-pink-100)' }}>
        <Modal.Title style={{ color: 'var(--nb-pink-900)', fontSize: '1rem' }}>New Notebook</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control autoFocus value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Data Structures" />
          </Form.Group>
          <Form.Group>
            <Form.Label>Color</Form.Label>
            <div className="d-flex flex-wrap gap-1 mt-1">
              {COLORS.map(c => (
                <button key={c} type="button"
                  onClick={() => setColorTag(c)}
                  style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: colorTag === c ? '2px solid #333' : '2px solid transparent', cursor: 'pointer' }}
                />
              ))}
            </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--nb-pink-50)' }}>
          <Button variant="secondary" size="sm" onClick={onHide}>Cancel</Button>
          <Button type="submit" size="sm" style={{ background: 'var(--nb-pink-400)', borderColor: 'var(--nb-pink-600)' }}>
            Create
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
