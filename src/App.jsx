import React from 'react';
import { FormulationProvider, useFormulation } from './contexts/FormulationContext';
import Header from './components/layout/Header';
import IngredientsTable from './components/ingredients/IngredientsTable';
import CostPanel from './components/analysis/CostPanel';
import ClassificationBadge from './components/analysis/ClassificationBadge';
import TechnicalPanel from './components/analysis/TechnicalPanel';
import SensoryPanel from './components/sensory/SensoryPanel';
import TrialNotes from './components/trials/TrialNotes';
import Notification from './components/common/Notification';
import { FlaskConical, Save, RotateCcw } from 'lucide-react';

function AppContent() {
  const { state, actions } = useFormulation();

  return (
    <div className="app">
      <header className="app-header">
        <h1><FlaskConical size={20} /> Fiche de Formulation</h1>
        <div className="toolbar-spacer" />
        <button className="btn btn-primary btn-sm" onClick={() => actions.notify('success', 'Données sauvegardées')}>
          <Save size={14} /> Sauvegarder
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => {
          if (confirm('Réinitialiser la fiche ? Toutes les données seront perdues.')) {
            actions.resetSheet();
            actions.notify('info', 'Fiche réinitialisée');
          }
        }}>
          <RotateCcw size={14} />
        </button>
      </header>

      <main className="app-main">
        <Header />

        <div className="panel">
          <IngredientsTable />
        </div>

        <div className="analysis-grid">
          <CostPanel />
          <ClassificationBadge />
        </div>

        <TechnicalPanel />
        <SensoryPanel />
        <TrialNotes />
      </main>

      {state.ui.notification && (
        <Notification
          type={state.ui.notification.type}
          message={state.ui.notification.message}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <FormulationProvider>
      <AppContent />
    </FormulationProvider>
  );
}
