import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../common/Modal';
import SearchableSelect, { highlightMatch } from '../common/SearchableSelect';
import { searchIngredients } from '../../data/ingredientDatabase';
import { INGREDIENT_TYPES, CLASSIFICATIONS } from '../../data/constants';

const emptyForm = {
  nom: '',
  type: 'support',
  classification: 'naturel',
  isExtrait: false,
  sourceExtrait: '',
  prix: 0,
  rgt: '',
  densite: 1.0,
  tauxVanilline: 0,
};

export default function IngredientForm({ isOpen, onClose, onSubmit, ingredient }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (ingredient) {
      setForm({ ...ingredient });
    } else {
      setForm(emptyForm);
    }
  }, [ingredient, isOpen]);

  const handleSubmit = () => {
    if (!form.nom.trim()) return;
    if (!form.rgt.trim()) return;
    onSubmit(form);
    onClose();
  };

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleIngredientSelect = useCallback((item) => {
    setForm(f => ({
      ...f,
      nom: item.nom,
      type: item.type,
      classification: item.classification,
      isExtrait: item.isExtrait,
      sourceExtrait: item.sourceExtrait,
      prix: item.prix,
      rgt: item.rgt,
      densite: item.densite,
      tauxVanilline: item.tauxVanilline,
    }));
  }, []);

  const renderIngredientItem = useCallback((item, query) => (
    <div className="ss-item-content">
      <div className="ss-item-name">{highlightMatch(item.nom, query)}</div>
      <div className="ss-item-detail">
        <span className={`ss-tag ${item.type}`}>
          {item.type === 'support' ? 'Support' : 'Arom.'}
        </span>
        <span>{item.rgt}</span>
        <span>{item.prix}€/kg</span>
      </div>
    </div>
  ), []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ingredient ? 'Modifier la matière première' : 'Nouvelle matière première'}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Sauvegarder</button>
        </>
      }
    >
      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
        <label className="form-label">Nom *</label>
        <SearchableSelect
          value={form.nom}
          onChange={(text) => update('nom', text)}
          onSelect={handleIngredientSelect}
          searchFn={searchIngredients}
          renderItem={renderIngredientItem}
          placeholder="Rechercher une matière première..."
          allowCustom={true}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
        <label className="form-label">N° Règlement *</label>
        <input className="form-input" value={form.rgt} onChange={e => update('rgt', e.target.value)} placeholder="Ex: SUP001" />
      </div>

      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
        <label className="form-label">Type</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {Object.entries(INGREDIENT_TYPES).map(([key, { label, color }]) => (
            <button
              key={key}
              className={`btn btn-sm ${form.type === key ? 'btn-primary' : 'btn-outline'}`}
              style={form.type === key ? {} : { background: color }}
              onClick={() => update('type', key)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
        <label className="form-label">Classification</label>
        <select className="form-select" value={form.classification} onChange={e => update('classification', e.target.value)}>
          {Object.entries(CLASSIFICATIONS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={form.isExtrait}
            onChange={e => update('isExtrait', e.target.checked)}
          />
          Est un extrait
        </label>
      </div>

      {form.isExtrait && (
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <label className="form-label">Source X</label>
          <input className="form-input" value={form.sourceExtrait} onChange={e => update('sourceExtrait', e.target.value)} placeholder="Ex: vanille, citron" />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
        <div className="form-group">
          <label className="form-label">Prix (EUR/kg)</label>
          <input type="number" className="form-input" value={form.prix} onChange={e => update('prix', parseFloat(e.target.value) || 0)} step="0.01" min="0" />
        </div>
        <div className="form-group">
          <label className="form-label">Densité (g/mL)</label>
          <input type="number" className="form-input" value={form.densite} onChange={e => update('densite', parseFloat(e.target.value) || 0)} step="0.001" min="0" />
        </div>
        <div className="form-group">
          <label className="form-label">Vanilline (%)</label>
          <input type="number" className="form-input" value={form.tauxVanilline} onChange={e => update('tauxVanilline', parseFloat(e.target.value) || 0)} step="0.01" min="0" max="100" />
        </div>
      </div>
    </Modal>
  );
}
