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

export const RussianDrillingForm = () => {
  const { insertRussianDrilling, getMaterialLogs, getUniqueSubjects } = useDatabase();
  
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    Subject: '',
    MaterialID: '',
    MaterialNameEN: '',
    MaterialNameRU: '',
    AttemptNumber: 1,
    Status: 'Learning',
    ErrorsRU: '',
    ResolutionStrategyRU: '',
    CommentaryRU: '',
    UsedKeywordList: ''
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

  const handleSelectMaterial = (materialId) => {
    const material = materials.find(m => m.MaterialID === materialId);
    if (material) {
      setFormData({
        ...formData,
        Subject: material.Subject,
        MaterialID: material.MaterialID,
        MaterialNameEN: material.MaterialNameEN
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await insertRussianDrilling({
      ...formData,
      DateTimeGMT7: new Date().toISOString()
    });

    alert('Russian drilling entry logged!');
    
    // Reset form but keep material context
    setFormData({
      ...formData,
      AttemptNumber: formData.AttemptNumber + 1,
      ErrorsRU: '',
      ResolutionStrategyRU: '',
      CommentaryRU: '',
      UsedKeywordList: ''
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">🇷🇺 Russian Drilling Log</h3>
      
      {/* Quick Load Material */}
      {materials.length > 0 && (
        <div className="mb-4 p-3 bg-muted rounded-md">
          <Label className="text-sm mb-2 block">Select Material to Drill</Label>
          <Select onValueChange={handleSelectMaterial}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a material..." />
            </SelectTrigger>
            <SelectContent>
              {materials.map(m => (
                <SelectItem key={m.id} value={m.MaterialID}>
                  {m.MaterialNameEN}
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
            list="subjects-russian"
            value={formData.Subject}
            onChange={e => setFormData({...formData, Subject: e.target.value})}
            required
          />
          <datalist id="subjects-russian">
            {subjects.map((s, i) => <option key={i} value={s} />)}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Material ID *</Label>
            <Input 
              value={formData.MaterialID}
              onChange={e => setFormData({...formData, MaterialID: e.target.value})}
              required
            />
          </div>

          <div>
            <Label>Attempt Number</Label>
            <Input 
              type="number"
              value={formData.AttemptNumber}
              onChange={e => setFormData({...formData, AttemptNumber: parseInt(e.target.value) || 1})}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Material Name (EN) *</Label>
            <Input 
              value={formData.MaterialNameEN}
              onChange={e => setFormData({...formData, MaterialNameEN: e.target.value})}
              required
            />
          </div>

          <div>
            <Label>Название материала (RU) *</Label>
            <Input 
              value={formData.MaterialNameRU}
              onChange={e => setFormData({...formData, MaterialNameRU: e.target.value})}
              placeholder="Русское название"
              required
            />
          </div>
        </div>

        <div>
          <Label>Status / Статус</Label>
          <Select value={formData.Status} onValueChange={(val) => setFormData({...formData, Status: val})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Learning">📚 Изучение (Learning)</SelectItem>
              <SelectItem value="Practicing">💪 Практика (Practicing)</SelectItem>
              <SelectItem value="Mastered">✅ Освоено (Mastered)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Ошибки (Errors in Russian)</Label>
          <Textarea 
            value={formData.ErrorsRU}
            onChange={e => setFormData({...formData, ErrorsRU: e.target.value})}
            rows={3}
            placeholder="Опишите ошибки на русском языке..."
          />
        </div>

        <div>
          <Label>Стратегия решения (Resolution Strategy)</Label>
          <Textarea 
            value={formData.ResolutionStrategyRU}
            onChange={e => setFormData({...formData, ResolutionStrategyRU: e.target.value})}
            rows={2}
            placeholder="Как вы исправили ошибку?"
          />
        </div>

        <div>
          <Label>Комментарий (Commentary)</Label>
          <Textarea 
            value={formData.CommentaryRU}
            onChange={e => setFormData({...formData, CommentaryRU: e.target.value})}
            rows={2}
            placeholder="Дополнительные заметки..."
          />
        </div>

        <div>
          <Label>Ключевые слова (Keywords)</Label>
          <Input 
            value={formData.UsedKeywordList}
            onChange={e => setFormData({...formData, UsedKeywordList: e.target.value})}
            placeholder="рекурсия, динамическое программирование..."
          />
        </div>

        <Button type="submit" className="w-full">
          Сохранить (Save Drilling Entry)
        </Button>
      </form>
    </Card>
  );
};
