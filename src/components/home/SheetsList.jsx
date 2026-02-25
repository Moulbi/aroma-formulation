import React, { useState, useMemo } from 'react';
import { Plus, Copy, Trash2, FileText, Search, FlaskConical, Pencil } from 'lucide-react';
import { loadSheetsIndex, saveSheetsIndex, deleteSheet, duplicateSheet } from '../../utils/persistence';
import { generateId, generateSheetRef } from '../../utils/helpers';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function SheetsList({ onOpen }) {
  const [sheets, setSheets] = useState(() => loadSheetsIndex());
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingName, setEditingName] = useState(null);
  const [editValue, setEditValue] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return sheets;
    const q = search.toLowerCase();
    return sheets.filter(s =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.reference || '').toLowerCase().includes(q) ||
      (s.responsible || '').toLowerCase().includes(q) ||
      (s.client || '').toLowerCase().includes(q)
    );
  }, [sheets, search]);

  const sorted = useMemo(() =>
    [...filtered].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)),
    [filtered]
  );

  const handleNew = () => {
    const id = generateId();
    const now = new Date().toISOString();
    const existingRefs = sheets.map(s => s.reference).filter(Boolean);
    const ref = generateSheetRef(existingRefs);
    const meta = {
      id, name: '', reference: ref, responsible: '', client: '', application: '',
      createdAt: now, updatedAt: now,
    };
    const updated = [...sheets, meta];
    saveSheetsIndex(updated);
    setSheets(updated);
    onOpen(id);
  };

  const handleDuplicate = (id) => {
    const newId = duplicateSheet(id);
    if (newId) setSheets(loadSheetsIndex());
  };

  const handleDelete = (id) => {
    deleteSheet(id);
    setSheets(loadSheetsIndex());
    setConfirmDelete(null);
  };

  const startEditName = (e, sheet) => {
    e.stopPropagation();
    setEditingName(sheet.id);
    setEditValue(sheet.name || '');
  };

  const commitName = (id) => {
    const index = loadSheetsIndex();
    const idx = index.findIndex(s => s.id === id);
    if (idx >= 0) {
      index[idx] = { ...index[idx], name: editValue.trim() };
      saveSheetsIndex(index);
      setSheets(index);
    }
    setEditingName(null);
  };

  return (
    <div className="sheets-home">
      <div className="sheets-header">
        <div className="sheets-brand">
          <FlaskConical size={28} />
          <div>
            <h1>Aroma Formulation</h1>
            <p>Fiches de formulation aromatique</p>
          </div>
        </div>
      </div>

      <div className="sheets-toolbar">
        <button className="btn btn-primary" onClick={handleNew}>
          <Plus size={16} /> Nouvelle fiche
        </button>
        <div className="sheets-search">
          <Search size={14} />
          <input
            type="text"
            placeholder="Rechercher une fiche..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="sheets-count">{sheets.length} fiche{sheets.length !== 1 ? 's' : ''}</span>
      </div>

      {sorted.length === 0 && !search ? (
        <div className="sheets-empty">
          <FileText size={48} strokeWidth={1} />
          <p>Aucune fiche de formulation</p>
          <button className="btn btn-primary" onClick={handleNew}>
            <Plus size={16} /> Créer votre première fiche
          </button>
        </div>
      ) : sorted.length === 0 && search ? (
        <div className="sheets-empty">
          <Search size={48} strokeWidth={1} />
          <p>Aucun résultat pour "{search}"</p>
        </div>
      ) : (
        <div className="sheets-table-wrapper">
          <table className="sheets-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Nom</th>
                <th>Responsable</th>
                <th>Client</th>
                <th>Application</th>
                <th>Créée le</th>
                <th>Modifiée le</th>
                <th className="sheets-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(sheet => (
                <tr key={sheet.id} className="sheets-row" onDoubleClick={() => onOpen(sheet.id)}>
                  <td className="sheets-cell-ref" onClick={() => onOpen(sheet.id)}>
                    <FileText size={14} />
                    <span>{sheet.reference || '—'}</span>
                  </td>
                  <td className="sheets-cell-name-edit">
                    {editingName === sheet.id ? (
                      <input
                        className="sheets-name-input"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => commitName(sheet.id)}
                        onKeyDown={e => { if (e.key === 'Enter') commitName(sheet.id); if (e.key === 'Escape') setEditingName(null); }}
                        autoFocus
                        placeholder="Nom de la fiche..."
                      />
                    ) : (
                      <span className="sheets-name-display" onClick={e => startEditName(e, sheet)}>
                        {sheet.name || <span className="sheets-name-placeholder">Ajouter un nom...</span>}
                        <Pencil size={11} className="sheets-name-pencil" />
                      </span>
                    )}
                  </td>
                  <td>{sheet.responsible || '—'}</td>
                  <td>{sheet.client || '—'}</td>
                  <td>{sheet.application || '—'}</td>
                  <td className="sheets-cell-date">{formatDate(sheet.createdAt)}</td>
                  <td className="sheets-cell-date">{formatDate(sheet.updatedAt)}</td>
                  <td className="sheets-cell-actions">
                    {confirmDelete === sheet.id ? (
                      <div className="sheets-confirm-delete">
                        <span className="sheets-confirm-label">Supprimer ?</span>
                        <button className="btn btn-danger btn-xs" onClick={() => handleDelete(sheet.id)}>Oui</button>
                        <button className="btn btn-outline btn-xs" onClick={() => setConfirmDelete(null)}>Non</button>
                      </div>
                    ) : (
                      <>
                        <button className="btn-icon" onClick={() => onOpen(sheet.id)} title="Ouvrir">
                          <FileText size={14} />
                        </button>
                        <button className="btn-icon" onClick={() => handleDuplicate(sheet.id)} title="Dupliquer">
                          <Copy size={14} />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => setConfirmDelete(sheet.id)}
                          title="Supprimer"
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
