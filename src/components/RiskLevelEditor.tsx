import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Shield } from 'lucide-react';
import { updatePatientRiskLevel, createPatientRiskHistoryEntry } from '@/db/services';
import { getRiskLevelColor } from '@/services/riskAssessment';
import { toast } from 'sonner';
import type { Patient } from '@/App';

interface RiskLevelEditorProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onRiskUpdated: (updatedPatient: Patient) => void;
}

const RISK_FACTORS_OPTIONS = [
  'Uncontrolled hypertension',
  'Diabetes with complications',
  'History of heart disease',
  'Chronic kidney disease',
  'Obesity (BMI > 30)',
  'Smoking/tobacco use',
  'Medication non-compliance',
  'Frequent ER visits',
  'Mental health concerns',
  'Social isolation',
  'Fall risk',
  'Polypharmacy',
  'Recent hospitalization',
  'Advanced age (>75)',
  'Cognitive impairment',
];

export function RiskLevelEditor({ isOpen, onClose, patient, onRiskUpdated }: RiskLevelEditorProps) {
  const [riskLevel, setRiskLevel] = useState(patient.riskLevel || 'low');
  const [riskScore, setRiskScore] = useState(patient.riskScore || 0);
  const [riskFactors, setRiskFactors] = useState<string[]>(patient.riskFactors || []);
  const [riskNotes, setRiskNotes] = useState(patient.riskNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Update patient risk level
      const updated = await updatePatientRiskLevel(
        patient.id,
        riskLevel,
        riskScore,
        riskFactors,
        riskNotes
      );

      // Create risk history entry (manual update)
      await createPatientRiskHistoryEntry(
        patient.id,
        null,
        riskLevel,
        riskScore,
        riskFactors,
        'manual',
        riskNotes
      );

      if (updated) {
        toast.success('Risk level updated successfully');
        onRiskUpdated({
          ...patient,
          riskLevel,
          riskScore,
          riskFactors,
          riskNotes,
        });
        onClose();
      }
    } catch (error) {
      console.error('Error updating risk level:', error);
      toast.error('Failed to update risk level');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRiskFactor = (factor: string) => {
    setRiskFactors(prev => 
      prev.includes(factor)
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    );
  };

  const getRiskScoreFromLevel = (level: string): number => {
    switch (level) {
      case 'critical': return 85;
      case 'high': return 65;
      case 'moderate': return 40;
      case 'low':
      default: return 15;
    }
  };

  const handleRiskLevelChange = (level: string) => {
    setRiskLevel(level as 'low' | 'medium' | 'high');
    setRiskScore(getRiskScoreFromLevel(level));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Edit Risk Level - {patient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Risk Level Selection */}
          <div className="space-y-2">
            <Label>Risk Level</Label>
            <Select value={riskLevel} onValueChange={handleRiskLevelChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    Low Risk
                  </div>
                </SelectItem>
                <SelectItem value="moderate">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    Moderate Risk
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    High Risk
                  </div>
                </SelectItem>
                <SelectItem value="critical">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    Critical Risk
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Risk Score Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Risk Score</Label>
              <span className="text-sm font-medium">{riskScore}/100</span>
            </div>
            <Slider
              value={[riskScore]}
              onValueChange={(value) => setRiskScore(value[0])}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low (0-25)</span>
              <span>Moderate (26-50)</span>
              <span>High (51-75)</span>
              <span>Critical (76+)</span>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="space-y-2">
            <Label>Risk Factors</Label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
              {RISK_FACTORS_OPTIONS.map((factor) => (
                <Badge
                  key={factor}
                  variant={riskFactors.includes(factor) ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => toggleRiskFactor(factor)}
                >
                  {factor}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Click to select/deselect risk factors
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="riskNotes">Notes</Label>
            <Textarea
              id="riskNotes"
              value={riskNotes}
              onChange={(e) => setRiskNotes(e.target.value)}
              placeholder="Additional notes about risk assessment..."
              rows={3}
            />
          </div>

          {/* Preview */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Assessment:</span>
              <Badge className={getRiskLevelColor(riskLevel)}>
                {riskLevel.toUpperCase()} ({riskScore})
              </Badge>
            </div>
            {riskFactors.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                {riskFactors.length} risk factor{riskFactors.length !== 1 ? 's' : ''} identified
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
