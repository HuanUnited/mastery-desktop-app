import { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import { useDatabase } from '../hooks/useDatabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';

export const ErrorEntryForm = ({ onEntryAdded }) => {
  const { capturedTime, clearCapturedTime } = useTimer();
  const { insertErrorLog, getLastErrorEntry, getUniqueSubjects } = useDatabase();
  
  const [subjects, setSubjects] = useState([]);
  const [justCaptured, setJustCaptured] = useState(false);
  const [formData, setFormData] = useState({
    Subject: '',
    MaterialNameEN: '',
    MaterialNameRU: '',
    ProblemID: '',
    ProblemTitle: '',
    TimeSpentMinutes: 0,
    Successful: false,
    UsedResources: '',
    ErrorsDescription: '',
    ResolutionStrategy: '',
    Annotation: '',
    Commentary: '',
    StatusTag: 'In Progress',
    RelatedMaterial: ''
  });

  useEffect(() => {
    loadSubjects();
    loadLastEntry();
  }, []);

  useEffect(() => {
    if (capturedTime > 0) {
      console.log('✅ Timer captured:', capturedTime, 'minutes - Auto-filling form');
      setFormData(prev => ({ ...prev, TimeSpentMinutes: capturedTime }));
      setJustCaptured(true);
      
      // Clear highlight after 2 seconds
      setTimeout(() => setJustCaptured(false), 2000);
    }
  }, [capturedTime]);

  const loadSubjects = async () => {
    const subjectList = await getUniqueSubjects();
    setSubjects(subjectList);
  };

  const loadLastEntry = async () => {
    const lastEntry = await getLastErrorEntry();
    if (lastEntry) {
      setFormData(prev => ({
        ...prev,
        Subject: lastEntry.Subject,
        MaterialNameEN: lastEntry.MaterialNameEN,
        MaterialNameRU: lastEntry.MaterialNameRU
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.ProblemID.trim()) {
      alert('Problem ID is required');
      return;
    }
    
    try {
      const result = await insertErrorLog({
        ...formData,
        Successful: formData.Successful ? 1 : 0,
        DateTimeGMT7: new Date().toISOString()
      });

      console.log('✅ Entry saved with ID:', result.lastInsertRowid);
      alert('Entry logged successfully!');
      
      // Clear captured time after successful submit
      clearCapturedTime();
      
      // Trigger refresh callback
      if (onEntryAdded) {
        onEntryAdded();
      }
      
      // Reset form but keep context
      const keepSubject = formData.Subject;
      const keepMaterialEN = formData.MaterialNameEN;
      const keepMaterialRU = formData.MaterialNameRU;
      
      setFormData({
        Subject: keepSubject,
        MaterialNameEN: keepMaterialEN,
        MaterialNameRU: keepMaterialRU,
        ProblemID: '',
        ProblemTitle: '',
        TimeSpentMinutes: 0,
        Successful: false,
        UsedResources: '',
        ErrorsDescription: '',
        ResolutionStrategy: '',
        Annotation: '',
        Commentary: '',
        StatusTag: 'In Progress',
        RelatedMaterial: ''
      });
    } catch (error) {
      console.error('❌ Failed to save entry:', error);
      alert('Failed to save entry. Check console for details.');
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Error Entry Log</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Subject *</Label>
            <Input 
              list="subjects"
              value={formData.Subject} 
              onChange={e => setFormData({...formData, Subject: e.target.value})}
              required
            />
            <datalist id="subjects">
              {subjects.map((s, i) => <option key={i} value={s} />)}
            </datalist>
          </div>

          <div>
            <Label>Material Name (EN) *</Label>
            <Input 
              value={formData.MaterialNameEN}
              onChange={e => setFormData({...formData, MaterialNameEN: e.target.value})}
              required
            />
          </div>

          <div>
            <Label>Material Name (RU)</Label>
            <Input 
              value={formData.MaterialNameRU}
              onChange={e => setFormData({...formData, MaterialNameRU: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Problem ID *</Label>
            <Input 
              value={formData.ProblemID}
              onChange={e => setFormData({...formData, ProblemID: e.target.value})}
              required
            />
          </div>

          <div>
            <Label>Problem Title</Label>
            <Input 
              value={formData.ProblemTitle}
              onChange={e => setFormData({...formData, ProblemTitle: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>
              Time Spent (minutes) 
              {capturedTime > 0 && <span className="text-green-600 ml-2">✓ Auto-filled from timer</span>}
            </Label>
            <Input 
              type="number"
              value={formData.TimeSpentMinutes}
              onChange={e => setFormData({...formData, TimeSpentMinutes: parseInt(e.target.value) || 0})}
              className={`transition-all duration-300 ${
                justCaptured 
                  ? 'bg-green-100 dark:bg-green-900/30 border-green-500 ring-2 ring-green-500' 
                  : 'bg-background'
              }`}
            />
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <Checkbox 
              id="successful"
              checked={formData.Successful}
              onCheckedChange={(checked) => setFormData({...formData, Successful: checked})}
            />
            <Label htmlFor="successful">✅ Successful Attempt</Label>
          </div>
        </div>

        <div>
          <Label>Errors Description</Label>
          <Textarea 
            value={formData.ErrorsDescription}
            onChange={e => setFormData({...formData, ErrorsDescription: e.target.value})}
            rows={3}
            placeholder="What went wrong? Be specific."
          />
        </div>

        <div>
          <Label>Resolution Strategy</Label>
          <Textarea 
            value={formData.ResolutionStrategy}
            onChange={e => setFormData({...formData, ResolutionStrategy: e.target.value})}
            rows={2}
            placeholder="How did you fix it or what should you do differently?"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Used Resources</Label>
            <Input 
              value={formData.UsedResources}
              onChange={e => setFormData({...formData, UsedResources: e.target.value})}
              placeholder="e.g., Stack Overflow, ChatGPT, textbook"
            />
          </div>

          <div>
            <Label>Status Tag</Label>
            <Input 
              value={formData.StatusTag}
              onChange={e => setFormData({...formData, StatusTag: e.target.value})}
            />
          </div>
        </div>

        <div>
          <Label>Commentary (Optional)</Label>
          <Textarea 
            value={formData.Commentary}
            onChange={e => setFormData({...formData, Commentary: e.target.value})}
            rows={2}
            placeholder="Any additional notes or insights"
          />
        </div>

        <Button type="submit" className="w-full" size="lg">
          Submit Error Entry
        </Button>
      </form>
    </Card>
  );
};
