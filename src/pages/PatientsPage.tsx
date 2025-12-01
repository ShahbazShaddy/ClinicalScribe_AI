import React, { useMemo, useState } from 'react';
import type { User, Patient, Page } from '@/App';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface PatientsPageProps {
  user: User;
  onNavigate: (page: Page) => void;
  onViewPatient: (patient: Patient) => void;
  onLogout: () => void;
}

const SAMPLE_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Sarah Johnson',
    age: 52,
    gender: 'F',
    diagnoses: ['Type 2 Diabetes', 'Hypertension'],
    medications: ['Metformin 500mg', 'Lisinopril 10mg'],
    allergies: ['Penicillin'],
    lastVisit: '2025-11-12',
    visits: new Array(8).fill(0).map((_, i) => ({
      date: new Date(Date.now() - i * 30 * 24 * 3600 * 1000).toISOString().slice(0,10),
      complaint: i === 0 ? 'Routine diabetes follow-up' : 'Follow-up',
      vitals: { bp: '130/80', weight: 78 - i * 0.2 },
      summary: 'Stable glycemic control, small medication adjustment.' ,
      type: i === 0 ? 'follow-up' : 'routine'
    }))
  },
  {
    id: 'p2',
    name: 'John Martinez',
    age: 65,
    gender: 'M',
    diagnoses: ['CHF', 'CAD'],
    medications: ['Furosemide 40mg', 'Aspirin 81mg'],
    allergies: [],
    lastVisit: '2025-11-10',
    visits: new Array(12).fill(0).map((_, i) => ({
      date: new Date(Date.now() - i * 14 * 24 * 3600 * 1000).toISOString().slice(0,10),
      complaint: i % 3 === 0 ? 'Dyspnea' : 'Medication check',
      vitals: { bp: '140/85', weight: 92 - i * 0.1 },
      summary: 'Manage fluid status and optimize diuretics.',
      type: i % 3 === 0 ? 'urgent' : 'follow-up'
    }))
  },
  {
    id: 'p3',
    name: 'Emily Chen',
    age: 48,
    gender: 'F',
    diagnoses: ['Asthma', 'Anxiety'],
    medications: ['Budesonide inhaler', 'Sertraline 50mg'],
    allergies: ['Sulfa'],
    lastVisit: '2025-10-02',
    visits: new Array(6).fill(0).map((_, i) => ({
      date: new Date(Date.now() - i * 45 * 24 * 3600 * 1000).toISOString().slice(0,10),
      complaint: 'Wheeze / cough',
      vitals: { bp: '120/76', weight: 64 + i * 0.3 },
      summary: 'Adjusted inhaler technique and reviewed action plan.',
      type: 'routine'
    }))
  },
  {
    id: 'p4',
    name: 'Robert Williams',
    age: 71,
    gender: 'M',
    diagnoses: ['COPD', 'HTN', 'Hyperlipidemia'],
    medications: ['Atorvastatin 20mg', 'Amlodipine 5mg'],
    allergies: [],
    lastVisit: '2025-11-20',
    visits: new Array(10).fill(0).map((_, i) => ({
      date: new Date(Date.now() - i * 28 * 24 * 3600 * 1000).toISOString().slice(0,10),
      complaint: i % 4 === 0 ? 'Exacerbation' : 'Routine COPD review',
      vitals: { bp: '135/78', weight: 80 - i * 0.2 },
      summary: 'Pulmonary status reviewed; inhaler plan reinforced.',
      type: i % 4 === 0 ? 'urgent' : 'routine'
    }))
  },
  // Additional sample patients
  { id: 'p5', name: 'Aisha Khan', age: 39, gender: 'F', diagnoses:['Hypothyroidism'], medications:['Levothyroxine 75mcg'], allergies:[], lastVisit:'2025-09-15', visits: [{date:'2025-09-15', complaint:'Routine', vitals:{bp:'118/72', weight:68}, summary:'TSH stable', type:'routine'}] },
  { id: 'p6', name: 'Michael Brown', age: 57, gender: 'M', diagnoses:['CKD stage 3'], medications:['Losartan 50mg'], allergies:['Latex'], lastVisit:'2025-08-20', visits:[{date:'2025-08-20', complaint:'Renal function review', vitals:{bp:'145/88', weight:85}, summary:'Monitor eGFR and labs', type:'follow-up'}] },
  { id: 'p7', name: 'Olivia Davis', age: 29, gender: 'F', diagnoses:['Migraine'], medications:['Topiramate 50mg'], allergies:[], lastVisit:'2025-07-11', visits:[{date:'2025-07-11', complaint:'Migraine frequency increase', vitals:{bp:'110/70', weight:59}, summary:'Titrated medication', type:'routine'}] },
  { id: 'p8', name: 'Daniel Lee', age: 45, gender: 'M', diagnoses:['Obesity', 'OSA'], medications:['CPAP'], allergies:[], lastVisit:'2025-06-05', visits:[{date:'2025-06-05', complaint:'Weight management', vitals:{bp:'132/82', weight:105}, summary:'Dietary counseling', type:'follow-up'}] }
];

export default function PatientsPage({ user, onNavigate, onViewPatient, onLogout }: PatientsPageProps) {
  const [query, setQuery] = useState('');

  const patients = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SAMPLE_PATIENTS.filter(p => p.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <DashboardLayout user={user} currentPage="patients" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Patient Records</h1>
          <p className="text-sm text-muted-foreground">Search and review patient timelines</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="search"
            placeholder="Search patients by name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-md border px-3 py-2 w-full sm:w-64"
          />
          <Button variant="ghost" onClick={() => { setQuery(''); }} className="w-full sm:w-auto">
            Clear
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead className="bg-sky-50 sticky top-0">
              <tr>
                <th className="text-left px-3 py-3 sm:px-4">Patient Name</th>
                <th className="hidden sm:table-cell text-left px-3 py-3 sm:px-4">Age</th>
                <th className="hidden md:table-cell text-left px-3 py-3 sm:px-4">Last Visit</th>
                <th className="hidden lg:table-cell text-left px-3 py-3 sm:px-4">Total Visits</th>
                <th className="text-right px-3 py-3 sm:px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id} className="border-t hover:bg-accent/50 transition-colors">
                  <td className="px-3 py-3 sm:px-4">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{p.diagnoses.join(', ')}</div>
                  </td>
                  <td className="hidden sm:table-cell px-3 py-3 sm:px-4">{p.age}</td>
                  <td className="hidden md:table-cell px-3 py-3 sm:px-4">{p.lastVisit}</td>
                  <td className="hidden lg:table-cell px-3 py-3 sm:px-4">{p.visits?.length ?? 0}</td>
                  <td className="px-3 py-3 sm:px-4 text-right">
                    <Button size="sm" onClick={() => onViewPatient(p)}>View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
