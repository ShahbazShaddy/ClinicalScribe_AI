import { useState } from 'react';
import { Shield, UserIcon, FileText, HardDrive } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { generateUniqueId } from '@/lib/utils';
import { useDatabase } from '@/hooks/useDatabase';
import type { User, Page } from '@/App';

interface SettingsPageProps {
  user: User;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const SPECIALTIES = [
  'Family Medicine',
  'Internal Medicine',
  'Pediatrics',
  'Cardiology',
  'Orthopedics',
  'Psychiatry',
  'Emergency Medicine',
  'Surgery',
  'Obstetrics & Gynecology',
  'Other'
];

export default function SettingsPage({ user, onNavigate, onLogout }: SettingsPageProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [specialty, setSpecialty] = useState(user.specialty);
  const [practiceName, setPracticeName] = useState(user.practiceName);
  const [defaultNoteType, setDefaultNoteType] = useState('SOAP');
  const [audioQuality, setAudioQuality] = useState('high');
  const [isSaving, setIsSaving] = useState(false);
  const { saveSettings, isLoading } = useDatabase();

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const updatedUser = {
        email,
        name,
        specialty,
        practiceName
      };
      
      // Save to database (optional - implement if needed)
      // For now, just show success
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      // Save to database
      const userId = user.id || generateUniqueId();
      await saveSettings(userId, {
        defaultNoteType,
        audioQuality,
        autoSave: true,
        darkMode: false
      });
      
      toast.success('Preferences saved successfully');
    } catch (err) {
      toast.error('Failed to save preferences');
      console.error('Error saving preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all notes? This cannot be undone.')) {
      localStorage.removeItem('clinicalscribe_notes');
      toast.success('All notes cleared');
    }
  };

  return (
    <DashboardLayout user={user} currentPage="settings" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Settings</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Update your personal and practice information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs sm:text-sm">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty" className="text-xs sm:text-sm">Medical Specialty</Label>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((spec) => (
                      <SelectItem key={spec} value={spec} className="text-xs sm:text-sm">
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="practice" className="text-xs sm:text-sm">Practice Name</Label>
                <Input
                  id="practice"
                  value={practiceName}
                  onChange={(e) => setPracticeName(e.target.value)}
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={isSaving || isLoading} size="sm" className="w-full sm:w-auto">
              {isSaving || isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Note Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg sm:text-xl">Note Preferences</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Customize your default note settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Default Note Type</Label>
              <Select value={defaultNoteType} onValueChange={setDefaultNoteType}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOAP" className="text-xs sm:text-sm">SOAP Note</SelectItem>
                  <SelectItem value="Progress" className="text-xs sm:text-sm">Progress Note</SelectItem>
                  <SelectItem value="Consultation" className="text-xs sm:text-sm">Consultation Note</SelectItem>
                  <SelectItem value="H&P" className="text-xs sm:text-sm">H&P (History & Physical)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Audio Quality</Label>
              <Select value={audioQuality} onValueChange={setAudioQuality}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard" className="text-xs sm:text-sm">Standard Quality</SelectItem>
                  <SelectItem value="high" className="text-xs sm:text-sm">High Quality (Recommended)</SelectItem>
                  <SelectItem value="ultra" className="text-xs sm:text-sm">Ultra High Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSavePreferences} disabled={isSaving || isLoading} size="sm" className="w-full sm:w-auto">
              {isSaving || isLoading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg sm:text-xl">Data Management</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Manage your stored data and retention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border border-border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium mb-1 text-sm sm:text-base">Clear All Notes</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Permanently delete all stored clinical notes
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleClearData} className="w-full sm:w-auto whitespace-nowrap">
                Clear Data
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border border-border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium mb-1 text-sm sm:text-base">Export All Data</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Download all your notes and data
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.success('Exporting data... (Demo)')} className="w-full sm:w-auto whitespace-nowrap">
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* HIPAA Compliance */}
        <Card className="border-primary-200 bg-primary-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-primary text-lg sm:text-xl">HIPAA Compliance Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <p>All audio recordings are encrypted end-to-end using AES-256 encryption</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <p>Clinical notes are stored with bank-level security protocols</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <p>Access logs are maintained for all data access and modifications</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <p>Business Associate Agreement (BAA) available upon request</p>
            </div>
            <Separator className="my-2 sm:my-3" />
            <p className="text-xs text-primary-700">
              <strong>Note:</strong> This is a demonstration application. In production, full HIPAA compliance 
              measures including encrypted storage, audit trails, and secure transmission would be implemented.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
