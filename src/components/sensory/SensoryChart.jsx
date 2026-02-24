import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useFormulation } from '../../contexts/FormulationContext';

export default function SensoryChart() {
  const { state } = useFormulation();
  const { trials, sensoryDescriptors, ui } = state;
  const trial = trials[ui.selectedTrial];

  const chartData = useMemo(() => {
    return sensoryDescriptors.map(desc => {
      const profileEntry = trial?.sensoryProfile?.find(p => p.descriptor === desc.name);
      return {
        descriptor: desc.name,
        value: profileEntry?.value ?? 0,
        fullMark: 10,
      };
    });
  }, [sensoryDescriptors, trial?.sensoryProfile]);

  if (sensoryDescriptors.length < 3) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        Ajoutez au moins 3 descripteurs pour afficher le graphique
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid stroke="#e0e0e0" />
        <PolarAngleAxis
          dataKey="descriptor"
          tick={{ fill: '#555', fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 10]}
          tick={{ fill: '#999', fontSize: 10 }}
        />
        <Radar
          name="Profil"
          dataKey="value"
          stroke="#2563eb"
          fill="#2563eb"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
