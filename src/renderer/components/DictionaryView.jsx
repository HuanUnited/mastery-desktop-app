import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useDatabase } from '../hooks/useDatabase';
import { Search, Plus, Trash2, Edit2, X, Check, BookOpen, BarChart3 } from 'lucide-react';

export const DictionaryView = () => {
  const [activeTab, setActiveTab] = useState('vocabulary');
  const [vocabulary, setVocabulary] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectMaterials, setSubjectMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newWordForm, setNewWordForm] = useState({
    russianWord: '',
    englishTranslation: '',
    subject: '',
    materialID: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadVocabulary();
    loadSubjectStats();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      loadVocabulary();
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const loadVocabulary = async () => {
    const vocab = await window.electronAPI.getVocabulary(searchTerm);
    setVocabulary(vocab);
  };

  const loadSubjectStats = async () => {
    const stats = await window.electronAPI.getSubjectStats();
    setSubjects(stats);
  };

  const handleAddWord = async () => {
    if (!newWordForm.russianWord || !newWordForm.englishTranslation) {
      alert('Russian word and English translation are required');
      return;
    }

    await window.electronAPI.upsertVocabulary({
      ...newWordForm,
      firstSeenDate: new Date().toISOString(),
      lastReviewedDate: new Date().toISOString(),
      reviewCount: 1
    });

    setNewWordForm({
      russianWord: '',
      englishTranslation: '',
      subject: '',
      materialID: ''
    });
    setShowAddForm(false);
    loadVocabulary();
  };

  const handleEdit = (word) => {
    setEditingId(word.id);
    setEditForm(word);
  };

  const handleSaveEdit = async () => {
    await window.electronAPI.upsertVocabulary({
      ...editForm,
      lastReviewedDate: new Date().toISOString()
    });
    setEditingId(null);
    loadVocabulary();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this word?')) return;
    await window.electronAPI.deleteVocabulary(id);
    loadVocabulary();
  };

  const handleSubjectClick = async (subject) => {
    setSelectedSubject(subject);
    const materials = await window.electronAPI.getMaterialsBySubject(subject.Subject);
    setSubjectMaterials(materials);
  };

  // Vocabulary Section
  const renderVocabulary = () => (
    <div className="space-y-4">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Label>Search (English or Russian)</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search..."
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Word
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Word
          </h4>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <Label>Russian Word *</Label>
              <Input
                value={newWordForm.russianWord}
                onChange={(e) => setNewWordForm({ ...newWordForm, russianWord: e.target.value })}
                placeholder="например"
              />
            </div>
            <div>
              <Label>English Translation *</Label>
              <Input
                value={newWordForm.englishTranslation}
                onChange={(e) => setNewWordForm({ ...newWordForm, englishTranslation: e.target.value })}
                placeholder="for example"
              />
            </div>
            <div>
              <Label>Subject (Optional)</Label>
              <Input
                value={newWordForm.subject}
                onChange={(e) => setNewWordForm({ ...newWordForm, subject: e.target.value })}
                placeholder="Math, DSA, etc."
              />
            </div>
            <div>
              <Label>Material ID (Optional)</Label>
              <Input
                value={newWordForm.materialID}
                onChange={(e) => setNewWordForm({ ...newWordForm, materialID: e.target.value })}
                placeholder="Calculus-Ch5"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddWord} size="sm">
              <Check className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="text-sm text-muted-foreground mb-2">
        {vocabulary.length} {vocabulary.length === 1 ? 'word' : 'words'} found
      </div>

      {vocabulary.length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No vocabulary yet. Add your first Russian word!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {vocabulary.map((word) => (
            <Card key={word.id} className="p-4">
              {editingId === word.id ? (
                <div className="space-y-3">
                  <Input
                    value={editForm.russianWord || ''}
                    onChange={(e) => setEditForm({ ...editForm, russianWord: e.target.value })}
                    placeholder="Russian"
                  />
                  <Input
                    value={editForm.englishTranslation || ''}
                    onChange={(e) => setEditForm({ ...editForm, englishTranslation: e.target.value })}
                    placeholder="English"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit} size="sm">
                      <Check className="h-4 w-4 mr-2" /> Save
                    </Button>
                    <Button onClick={() => setEditingId(null)} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {word.russianWord}
                      </div>
                      <div className="text-lg text-muted-foreground">
                        {word.englishTranslation || <em className="text-red-500">No translation</em>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button onClick={() => handleEdit(word)} variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => handleDelete(word.id)} variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {(word.subject || word.materialID) && (
                    <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                      {word.subject && (
                        <span className="px-2 py-1 bg-muted rounded">
                          📚 {word.subject}
                        </span>
                      )}
                      {word.materialID && (
                        <span className="px-2 py-1 bg-muted rounded">
                          📖 {word.materialID}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-2 text-xs text-muted-foreground">
                    Reviewed {word.reviewCount} {word.reviewCount === 1 ? 'time' : 'times'} • 
                    Last: {new Date(word.lastReviewedDate).toLocaleDateString()}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Subject Statistics Section
  const renderSubjects = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Subject List */}
      <div className="lg:col-span-1">
        <h3 className="text-lg font-semibold mb-4">Your Subjects</h3>
        {subjects.length === 0 ? (
          <Card className="p-6 text-center">
            <BarChart3 className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No subjects yet</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {subjects.map((subject) => {
              const successRate = subject.totalProblems > 0
                ? ((subject.problemsSolved / subject.totalProblems) * 100).toFixed(1)
                : 0;

              return (
                <Card
                  key={subject.Subject}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedSubject?.Subject === subject.Subject
                      ? 'border-primary ring-2 ring-primary'
                      : ''
                  }`}
                  onClick={() => handleSubjectClick(subject)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg">{subject.Subject}</h4>
                    <span className="text-xs text-muted-foreground">
                      {subject.totalMaterials} materials
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Problems:</span>
                      <div className="font-semibold">
                        {subject.problemsSolved}/{subject.totalProblems}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Success:</span>
                      <div className="font-semibold text-green-600">{successRate}%</div>
                    </div>
                  </div>

                  {subject.avgAttempts && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Avg attempts: {subject.avgAttempts.toFixed(2)}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Material Details */}
      <div className="lg:col-span-2">
        {selectedSubject ? (
          <>
            <h3 className="text-lg font-semibold mb-4">
              Materials in {selectedSubject.Subject}
            </h3>
            {subjectMaterials.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No materials found</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {subjectMaterials.map((material) => {
                  const progress = material.TotalProblems > 0
                    ? (material.ProblemsSolved / material.TotalProblems) * 100
                    : 0;

                  return (
                    <Card key={material.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{material.MaterialNameEN}</h4>
                          <p className="text-sm text-muted-foreground">
                            ID: {material.MaterialID}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            material.Status === 'Mastered'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : material.Status === 'Learning'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}
                        >
                          {material.Status}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold">
                              {material.ProblemsSolved}/{material.TotalProblems} ({progress.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {material.AvgAttemptsLastBatch && (
                            <div>
                              <span className="text-muted-foreground">Avg Attempts:</span>
                              <div className="font-semibold">
                                {material.AvgAttemptsLastBatch.toFixed(2)}
                              </div>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Last Review:</span>
                            <div className="font-semibold">
                              {new Date(material.LastReviewedGMT7).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {material.Commentary && (
                          <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded">
                            {material.Commentary}
                          </p>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <Card className="p-12 text-center">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">Select a Subject</p>
            <p className="text-muted-foreground">
              Click on a subject to view its materials and statistics
            </p>
          </Card>
        )}
      </div>
    </div>
  );

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dictionary & Statistics</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('vocabulary')}
          className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'vocabulary'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Vocabulary ({vocabulary.length})
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'subjects'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Subject Stats ({subjects.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'vocabulary' ? renderVocabulary() : renderSubjects()}
    </Card>
  );
};
