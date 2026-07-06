import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from '../../src/components/Sidebar/Sidebar.jsx';
import { AppProvider } from '../../src/context/AppContext.jsx';

// Mock API modules
jest.mock('../../src/services/notebookApi.js', () => ({
  getNotebooks:   jest.fn().mockResolvedValue([]),
  createNotebook: jest.fn().mockResolvedValue({ id: 'nb-1', name: 'Test', colorTag: '#FF69B4' }),
  updateNotebook: jest.fn().mockResolvedValue({ id: 'nb-1', name: 'Renamed' }),
  deleteNotebook: jest.fn().mockResolvedValue(undefined),
  importNotebook: jest.fn().mockResolvedValue({}),
}));

jest.mock('../../src/services/pageApi.js', () => ({
  createPage: jest.fn().mockResolvedValue({ id: 'p-1', name: 'New Page', notebookId: 'nb-1' }),
  getPages:   jest.fn().mockResolvedValue([]),
}));

function renderSidebar() {
  return render(
    <AppProvider>
      <Sidebar />
    </AppProvider>
  );
}

describe('Sidebar', () => {
  beforeEach(() => jest.clearAllMocks());

  test('renders empty state when no notebooks exist', () => {
    renderSidebar();
    expect(screen.getByText(/no notebooks yet/i)).toBeInTheDocument();
  });

  test('clicking ＋ button opens New Notebook modal', () => {
    renderSidebar();
    fireEvent.click(screen.getByTitle('New Notebook'));
    expect(screen.getByText('New Notebook')).toBeInTheDocument();
  });

  test('submitting new notebook modal calls createNotebook', async () => {
    const { getByPlaceholderText, getByText } = renderSidebar();
    fireEvent.click(screen.getByTitle('New Notebook'));
    await userEvent.type(getByPlaceholderText(/data structures/i), 'Algorithms');
    fireEvent.click(getByText('Create'));
    const { createNotebook } = require('../../src/services/notebookApi.js');
    await waitFor(() => expect(createNotebook).toHaveBeenCalledWith('Algorithms', expect.any(String)));
  });

  test('Import ZIP button is rendered', () => {
    renderSidebar();
    expect(screen.getByText(/import zip/i)).toBeInTheDocument();
  });
});
