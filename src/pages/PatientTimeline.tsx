import React, { useMemo, useState } from 'react';
import type { User, Patient, Page } from '@/App';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface PatientTimelineProps {
  user: User;
  patient: Patient;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

function VisitRow({ visit, index }: { visit: any; index: number }) {
  const [open, setOpen] = useState(false);
  const color = visit.type === 'routine' ? 'bg-green-100 text-green-800' : visit.type === 'urgent' ? 'bg-yellow-100 text-yellow-800' : 'bg-sky-100 text-sky-800';

  return (
    <div className="flex gap-2 sm:gap-4">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full ${color}`} />
        {index < 9 && <div className="w-px bg-border h-full mt-1" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-medium">{visit.date}</div>
            <div className="text-xs text-muted-foreground line-clamp-2">{visit.complaint}</div>
          </div>
          <div className="text-xs sm:text-xs text-muted-foreground sm:text-right flex-shrink-0">
            <div>BP: {visit.vitals.bp}</div>
            <div>Wt: {Math.round(visit.vitals.weight * 10)/10} kg</div>
          </div>
        </div>
        <div className="mt-2 text-xs sm:text-sm line-clamp-2">{visit.summary}</div>
        <div className="mt-2">
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setOpen(!open)}>
            {open ? 'Collapse' : 'Expand'}
          </Button>
        </div>
        {open && (
          <div className="mt-3 p-2 sm:p-3 bg-muted rounded text-xs sm:text-sm">
            <pre className="whitespace-pre-wrap break-words">{visit.fullNote ?? visit.summary}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PatientTimeline({ user, patient, onNavigate, onLogout }: PatientTimelineProps) {
  React.useEffect(() => {
    console.log('PatientTimeline received patient:', patient);
  }, [patient]);

  if (!patient) {
    return (
      <DashboardLayout user={user} currentPage="patient" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No patient selected. Please go back and select a patient.</p>
          <Button onClick={() => onNavigate('patients')} className="mt-4">Back to Patients</Button>
        </div>
      </DashboardLayout>
    );
  }

  const visits = useMemo(() => {
    const v = patient.visits ?? [];
    return [...v].sort((a,b) => (b.date || '').localeCompare(a.date || ''));
  }, [patient]);

  const totalVisitsYear = visits.filter(v => {
    const d = new Date(v.date);
    const oneYearAgo = new Date(); oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return d >= oneYearAgo;
  }).length;

  const avgBP = (() => {
    if (!visits.length) return '—';
    // very naive systolic average from strings like '130/80'
    const systolics = visits.map(v => parseInt((v.vitals?.bp||'0/0').split('/')[0]||'0',10)).filter(n=>!Number.isNaN(n));
    if (!systolics.length) return '—';
    const avg = Math.round(systolics.reduce((a,b)=>a+b,0)/systolics.length);
    return `${avg}/${visits[0].vitals?.bp.split('/')[1] ?? '—'}`;
  })();

  const weightTrend = (() => {
    if (visits.length < 2) return '—';
    const first = visits[visits.length - 1].vitals?.weight;
    const last = visits[0].vitals?.weight;
    const diff = Math.round((last - first) * 10) / 10;
    return diff > 0 ? `+${diff} kg ↑` : diff < 0 ? `${diff} kg ↓` : 'No change';
  })();

  const adherence = Math.min(100, 80 + (patient.visits?.length || 0));

  return (
    <DashboardLayout user={user} currentPage="patient" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
      <div className="lg:col-span-3 space-y-4 sm:space-y-6">
        {/* Header card */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">{patient.name}</h2>
              <div className="text-xs sm:text-sm text-muted-foreground">{patient.age} yrs • {patient.gender === 'F' ? 'Female' : patient.gender === 'M' ? 'Male' : 'Other'}</div>
            </div>
            <div className="text-xs sm:text-sm">
              <div className="text-muted-foreground">Last visit</div>
              <div className="font-medium">{patient.lastVisit}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-muted-foreground font-medium">Primary diagnoses</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {patient.diagnoses.map((d) => (
                  <span key={d} className="px-2 py-1 rounded bg-sky-50 text-sky-700 text-xs">{d}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Current medications</div>
              <ul className="mt-2 text-xs sm:text-sm space-y-1">
                {patient.medications.map(m => <li key={m} className="leading-tight">{m}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Allergies</div>
              <div className="mt-2 text-xs sm:text-sm">{(patient.allergies && patient.allergies.length) ? patient.allergies.join(', ') : 'None'}</div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-card rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-primary mb-4">Visits</h3>
          <div className="space-y-6">
            {visits.map((v, i) => (
              <VisitRow key={i} visit={v} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Right sidebar quick stats */}
      <aside className="space-y-3 lg:space-y-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Quick Stats</h4>
          <div className="mt-3 grid grid-cols-2 lg:grid-cols-1 gap-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground">Visits (last yr)</div>
              <div className="font-medium">{totalVisitsYear}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground">Avg BP</div>
              <div className="font-medium">{avgBP}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground">Weight change</div>
              <div className="font-medium">{weightTrend}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground">Adherence</div>
              <div className="font-medium">{adherence}%</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow">
          <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Actions</h4>
          <div className="mt-3 flex flex-col gap-2">
            <Button onClick={() => onNavigate('patients')} size="sm">Back to Patients</Button>
          </div>
        </div>
      </aside>
      </div>
    </DashboardLayout>
  );
}
