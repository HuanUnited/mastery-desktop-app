import { useState, useEffect } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Checkbox } from './ui/checkbox';

export const MaterialStatusForm = () => {
  const { upsertMaterialLog, getMaterialLogs, getUniqueSubjects } = useDatabase();
  
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    Subject: '',
    MaterialID: '',
    MaterialNameEN: '',
    Status: 'Learning',
    TotalProblems: 0,
    ProblemsSolved: 0,
    AvgAttemptsLastBatch: 0,
    Commentary: '',
    ResourcesList: '',
    ForcedStopFlag: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const subjectList = await getUniqueSubjects();
    const materialList = await getMaterialLogs();
    setSubjects(subjectList);
    setMaterials(materialList);
  };

  const handleLoadMaterial = (materialId) => {
    const material = materials.find(m => m.MaterialID === materialId);
    if (material) {
      setFormData({
        Subject: material.Subject,
        MaterialID: material.MaterialID,
        MaterialNameEN: material.MaterialNameEN,
        Status: material.Status,
        TotalProblems: material.TotalProblems,
        ProblemsSolved: material.ProblemsSolved,
        AvgAttemptsLastBatch: material.AvgAttemptsLastBatch || 0,
        Commentary: material.Commentary || '',
        ResourcesList: material.ResourcesList || '',
        ForcedStopFlag: material.ForcedStopFlag === 1
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await upsertMaterialLog({
      ...formData,
      ForcedStopFlag: formData.ForcedStopFlag ? 1 : 0,
      LastReviewedGMT7: new Date().toISOString()
    });

    alert('Material status updated!');
    loadData();
    
    // Reset form but keep subject
    const currentSubject = formData.Subject;
    setFormData({
      Subject: currentSubject,
      MaterialID: '',
      MaterialNameEN: '',
      Status: 'Learning',
      TotalProblems: 0,
      ProblemsSolved: 0,
      AvgAttemptsLastBatch: 0,
      Commentary: '',
      ResourcesList: '',
      ForcedStopFlag: false
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Material Status</h3>
      
      {/* Quick Load Existing Material */}
      {materials.length > 0 && (
        <div className="mb-4 p-3 bg-muted rounded-md">
          <Label className="text-sm mb-2 block">Load Existing Material</Label>
          <Select onValueChange={handleLoadMaterial}>
            <SelectTrigger>
              <SelectValue placeholder="Select material to edit..." />
            </SelectTrigger>
            <SelectContent>
              {materials.map(m => (
                <SelectItem key={m.id} value={m.MaterialID}>
                  {m.MaterialNameEN} ({m.Status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Subject *</Label>
          <Input 
            list="subjects-material"
            value={formData.Subject}
            onChange={e => setFormData({...formData, Subject: e.target.value})}
            required
          />
          <datalist id="subjects-material">
            {subjects.map((s, i) => <option key={i} value={s} />)}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Material ID *</Label>
            <Input 
              value={formData.MaterialID}
              onChange={e => setFormData({...formData, MaterialID: e.target.value})}
              placeholder="e.g., BinarySearch-01"
              required
            />
          </div>

          <div>
            <Label>Material Name (EN) *</Label>
            <Input 
              value={formData.MaterialNameEN}
              onChange={e => setFormData({...formData, MaterialNameEN: e.target.value})}
              required
            />
          </div>
        </div>

        <div>
          <Label>Status *</Label>
          <Select value={formData.Status} onValueChange={(val) => setFormData({...formData, Status: val})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Not Started">🔘 Not Started</SelectItem>
              <SelectItem value="Learning">📚 Learning</SelectItem>
              <SelectItem value="Practicing">💪 Practicing</SelectItem>
              <SelectItem value="Mastered">✅ Mastered</SelectItem>
              <SelectItem value="Paused">⏸️ Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Total Problems</Label>
            <Input 
              type="number"
              value={formData.TotalProblems}
              onChange={e => setFormData({...formData, TotalProblems: parseInt(e.target.value) || 0})}
            />
          </div>

          <div>
            <Label>Problems Solved</Label>
            <Input 
              type="number"
              value={formData.ProblemsSolved}
              onChange={e => setFormData({...formData, ProblemsSolved: parseInt(e.target.value) || 0})}
            />
          </div>

          <div>
            <Label>Avg Attempts</Label>
            <Input 
              type="number"
              step="0.1"
              value={formData.AvgAttemptsLastBatch}
              onChange={e => setFormData({...formData, AvgAttemptsLastBatch: parseFloat(e.target.value) || 0})}
            />
          </div>
        </div>

        <div>
          <Label>Resources List</Label>
          <Input 
            value={formData.ResourcesList}
            onChange={e => setFormData({...formData, ResourcesList: e.target.value})}
            placeholder="e.g., LeetCode, CLRS Chapter 3"
          />
        </div>

        <div>
          <Label>Commentary</Label>
          <Textarea 
            value={formData.Commentary}
            onChange={e => setFormData({...formData, Commentary: e.target.value})}
            rows={3}
            placeholder="Notes on progress, challenges, next steps..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="forced-stop"
            checked={formData.ForcedStopFlag}
            onCheckedChange={(checked) => setFormData({...formData, ForcedStopFlag: checked})}
          />
          <Label htmlFor="forced-stop">🛑 Forced Stop (temporarily blocked)</Label>
        </div>

        <Button type="submit" className="w-full">
          Save Material Status
        </Button>
      </form>
    </Card>
  );
};
