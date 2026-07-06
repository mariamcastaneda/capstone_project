import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function ConfirmDeleteModal({ show, onHide, message, onConfirm }) {
  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton style={{ background: '#fff3f3' }}>
        <Modal.Title style={{ fontSize: '1rem', color: '#c0392b' }}>⚠ Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message ?? 'Are you sure you want to delete this item?'}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={onHide}>Cancel</Button>
        <Button variant="danger" size="sm" onClick={() => { onConfirm(); onHide(); }}>Delete</Button>
      </Modal.Footer>
    </Modal>
  );
}
