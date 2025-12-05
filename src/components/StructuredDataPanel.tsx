import { useState } from 'react';
import { Edit2, Save, X, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { StructuredData, Vitals } from '@/types/structuredData';

interface StructuredDataPanelProps {
  data?: StructuredData;
  onUpdate?: (data: StructuredData) => void;
}

export default function StructuredDataPanel({ data = {}, onUpdate }: StructuredDataPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<StructuredData>(data);

  const handleSave = () => {
    onUpdate?.(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(data);
    setIsEditing(false);
  };

  const getVitalStatusColor = (status?: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-50 border-green-200';
      case 'elevated':
        return 'bg-yellow-50 border-yellow-200';
      case 'high':
      case 'low':
        return 'bg-orange-50 border-orange-200';
      case 'critical':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusTextColor = (status?: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-700';
      case 'elevated':
        return 'text-yellow-700';
      case 'high':
      case 'low':
        return 'text-orange-700';
      case 'critical':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  const getStatusBadgeVariant = (status?: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'normal':
        return 'default';
      case 'critical':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (!data.vitals && !data.clinicalInfo && !data.symptoms) {
    return (
      <Card className="sticky top-6">
        <CardHeader>
          <CardTitle className="text-lg">Structured Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No structured data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Structured Data</h2>
        {!isEditing ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* VITALS SECTION */}
      {data.vitals && Object.keys(data.vitals).length > 0 && (
        <Card className="sticky top-28">
          <CardHeader>
            <CardTitle className="text-base">Vitals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Blood Pressure */}
            {data.vitals.bloodPressure && (
              <div className={`p-3 border rounded-lg ${getVitalStatusColor(data.vitals.bloodPressure.status)}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Blood Pressure</span>
                  <Badge variant={getStatusBadgeVariant(data.vitals.bloodPressure.status)}>
                    {data.vitals.bloodPressure.status || 'unknown'}
                  </Badge>
                </div>
                <div className={`text-lg font-semibold ${getStatusTextColor(data.vitals.bloodPressure.status)}`}>
                  {data.vitals.bloodPressure.systolic}/{data.vitals.bloodPressure.diastolic} mmHg
                </div>
              </div>
            )}

            {/* Heart Rate */}
            {data.vitals.heartRate && data.vitals.heartRate.value && (
              <div className={`p-3 border rounded-lg ${getVitalStatusColor(data.vitals.heartRate.status)}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Heart Rate</span>
                  <Badge variant={getStatusBadgeVariant(data.vitals.heartRate.status)}>
                    {data.vitals.heartRate.status || 'unknown'}
                  </Badge>
                </div>
                <div className={`text-lg font-semibold ${getStatusTextColor(data.vitals.heartRate.status)}`}>
                  {data.vitals.heartRate.value} bpm
                </div>
              </div>
            )}

            {/* Temperature */}
            {data.vitals.temperature && data.vitals.temperature.value && (
              <div className={`p-3 border rounded-lg ${getVitalStatusColor(data.vitals.temperature.status)}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Temperature</span>
                  <Badge variant={getStatusBadgeVariant(data.vitals.temperature.status)}>
                    {data.vitals.temperature.status || 'unknown'}
                  </Badge>
                </div>
                <div className={`text-lg font-semibold ${getStatusTextColor(data.vitals.temperature.status)}`}>
                  {data.vitals.temperature.value}°{data.vitals.temperature.unit || 'F'}
                </div>
              </div>
            )}

            {/* Weight */}
            {data.vitals.weight && data.vitals.weight.value && (
              <div className={`p-3 border rounded-lg ${getVitalStatusColor(data.vitals.weight.status)}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Weight</span>
                  <div className="flex items-center gap-2">
                    {data.vitals.weight.change !== undefined && data.vitals.weight.change !== 0 && (
                      <>
                        {data.vitals.weight.change > 0 ? (
                          <TrendingUp className="w-4 h-4 text-red-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-green-500" />
                        )}
                        <span className={data.vitals.weight.change > 0 ? 'text-red-600' : 'text-green-600'}>
                          {data.vitals.weight.change > 0 ? '+' : ''}{data.vitals.weight.change} {data.vitals.weight.unit}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className={`text-lg font-semibold ${getStatusTextColor(data.vitals.weight.status)}`}>
                  {data.vitals.weight.value} {data.vitals.weight.unit}
                </div>
              </div>
            )}

            {/* O2 Saturation */}
            {data.vitals.o2Saturation && data.vitals.o2Saturation.value && (
              <div className={`p-3 border rounded-lg ${getVitalStatusColor(data.vitals.o2Saturation.status)}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">O2 Saturation</span>
                  <Badge variant={getStatusBadgeVariant(data.vitals.o2Saturation.status)}>
                    {data.vitals.o2Saturation.status || 'unknown'}
                  </Badge>
                </div>
                <div className={`text-lg font-semibold ${getStatusTextColor(data.vitals.o2Saturation.status)}`}>
                  {data.vitals.o2Saturation.value}%
                </div>
              </div>
            )}

            {/* Respiratory Rate */}
            {data.vitals.respiratoryRate && data.vitals.respiratoryRate.value && (
              <div className={`p-3 border rounded-lg ${getVitalStatusColor(data.vitals.respiratoryRate.status)}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Respiratory Rate</span>
                  <Badge variant={getStatusBadgeVariant(data.vitals.respiratoryRate.status)}>
                    {data.vitals.respiratoryRate.status || 'unknown'}
                  </Badge>
                </div>
                <div className={`text-lg font-semibold ${getStatusTextColor(data.vitals.respiratoryRate.status)}`}>
                  {data.vitals.respiratoryRate.value} /min
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* CLINICAL INFO SECTION */}
      {data.clinicalInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Clinical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chief Complaint */}
            {data.clinicalInfo.chiefComplaint && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Chief Complaint</p>
                <p className="text-sm">{data.clinicalInfo.chiefComplaint}</p>
              </div>
            )}

            {/* Diagnoses */}
            {data.clinicalInfo.diagnoses && data.clinicalInfo.diagnoses.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Diagnoses</p>
                <div className="flex flex-wrap gap-2">
                  {data.clinicalInfo.diagnoses.map((diagnosis, idx) => (
                    <Badge key={idx} variant="outline">
                      {diagnosis}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Medications */}
            {data.clinicalInfo.medicationsMentioned && data.clinicalInfo.medicationsMentioned.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Medications</p>
                <ul className="space-y-1">
                  {data.clinicalInfo.medicationsMentioned.map((med, idx) => (
                    <li key={idx} className="text-sm">
                      <span className="font-medium">{med.name}</span>
                      {med.dosage && <span> {med.dosage}</span>}
                      {med.frequency && <span> - {med.frequency}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Lab Values */}
            {data.clinicalInfo.labValues && data.clinicalInfo.labValues.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Lab Values</p>
                <ul className="space-y-1">
                  {data.clinicalInfo.labValues.map((lab, idx) => (
                    <li key={idx} className="text-sm flex items-center justify-between">
                      <span>
                        <span className="font-medium">{lab.testName}</span>
                        {lab.unit && <span> ({lab.unit})</span>}
                      </span>
                      {lab.value && (
                        <Badge
                          variant={getStatusBadgeVariant(lab.status)}
                          className="ml-2"
                        >
                          {lab.value}
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Allergies */}
            {data.clinicalInfo.allergies && data.clinicalInfo.allergies.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Allergies</p>
                <div className="flex flex-wrap gap-2">
                  {data.clinicalInfo.allergies.map((allergy, idx) => (
                    <Badge key={idx} variant="destructive">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SYMPTOMS SECTION */}
      {data.symptoms && data.symptoms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Symptoms</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.symptoms.map((symptom, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <div>
                    <span className="font-medium">{symptom.name}</span>
                    {symptom.severity && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {symptom.severity}
                      </Badge>
                    )}
                    {symptom.duration && (
                      <p className="text-xs text-muted-foreground mt-1">{symptom.duration}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
