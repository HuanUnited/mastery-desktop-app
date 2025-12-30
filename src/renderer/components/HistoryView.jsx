import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Trash2, Edit2, X, Check } from 'lucide-react';

export const HistoryView = forwardRef((props, ref) => {
  const { getErrorLogs, getMaterialLogs, getRussianDrillingLogs } = useDatabase();
  const [activeTab, setActiveTab] = useState('errors');
  const [errorLogs, setErrorLogs] = useState([]);
  const [materialLogs, setMaterialLogs] = useState([]);
  const [russianLogs, setRussianLogs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadAllLogs();
  }, []);

const loadAllLogs = async () => {
  console.log('🔄 Loading all logs...');
  
  const errors = await getErrorLogs();
  const materials = await getMaterialLogs();
  const russian = await getRussianDrillingLogs();
  
  console.log('📊 Logs loaded:');
  console.log('  - Errors:', errors.length, errors);
  console.log('  - Materials:', materials.length);
  console.log('  - Russian:', russian.length);
  
  setErrorLogs(errors);
  setMaterialLogs(materials);
  setRussianLogs(russian);
};

  // Expose refresh to parent
  useImperativeHandle(ref, () => ({
    refresh: loadAllLogs
  }));

  const handleEdit = (log) => {
    setEditingId(log.id);
    setEditForm(log);
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Delete this entry permanently?')) return;
    
    try {
      if (type === 'error') {
        await window.electronAPI.deleteErrorLog(id);
      } else if (type === 'material') {
        await window.electronAPI.deleteMaterialLog(id);
      } else if (type === 'russian') {
        await window.electronAPI.deleteRussianDrilling(id);
      }
      loadAllLogs();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete entry');
    }
  };


  const handleSaveEdit = async () => {
    // TODO: Add update IPC handlers
    console.log('Save edit:', editForm);
    setEditingId(null);
    loadAllLogs();
  };

const renderErrorLogs = () => {
  // Group by problem for better context
  const groupedByProblem = {};
  errorLogs.forEach(log => {
    if (!groupedByProblem[log.ProblemID]) {
      groupedByProblem[log.ProblemID] = [];
    }
    groupedByProblem[log.ProblemID].push(log);
  });

  return (
    <div className="space-y-4">
      {errorLogs.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No error logs yet. Submit an entry to see it here.</p>
      ) : (
        errorLogs.map((log, idx) => {
          // Calculate batch context
          const sameProblemLogs = groupedByProblem[log.ProblemID] || [];
          const maxAttempt = Math.max(...sameProblemLogs.map(l => l.AttemptNumber));
          const currentBatchNum = Math.ceil(log.AttemptNumber / 5);
          const maxBatchNum = Math.ceil(maxAttempt / 5);
          const isLatestBatch = currentBatchNum === maxBatchNum;
          
          return (
            <Card key={log.id} className="p-4">
              {editingId === log.id ? (
                <div className="space-y-3">
                  <Input 
                    value={editForm.ProblemID || ''}
                    onChange={e => setEditForm({...editForm, ProblemID: e.target.value})}
                    placeholder="Problem ID"
                  />
                  <Textarea 
                    value={editForm.ErrorsDescription || ''}
                    onChange={e => setEditForm({...editForm, ErrorsDescription: e.target.value})}
                    placeholder="Errors"
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
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-lg">
                          {log.MaterialNameEN} - {log.ProblemID}
                        </h4>
                        {isLatestBatch && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full font-medium">
                            Latest Batch
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>{log.Subject}</span>
                        <span>•</span>
                        <span className="font-semibold">
                          Attempt #{log.AttemptNumber} (Batch {currentBatchNum}, Index {log.BatchAttemptIndex}/5)
                        </span>
                        <span>•</span>
                        <span>{new Date(log.DateTimeGMT7).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleEdit(log)} variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => handleDelete(log.id, 'error')} variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                    <div>
                      <span className="font-semibold">Time:</span> {log.TimeSpentMinutes} min
                    </div>
                    <div>
                      <span className="font-semibold">Status:</span>{' '}
                      {log.Successful ? '✅ Success' : '❌ Failed'}
                    </div>
                    <div>
                      <span className="font-semibold">Total Attempts:</span> {maxAttempt}
                    </div>
                  </div>

                  {log.ErrorsDescription && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                      <p className="text-sm font-semibold mb-1 text-red-900 dark:text-red-100">Errors:</p>
                      <p className="text-sm text-red-800 dark:text-red-200">{log.ErrorsDescription}</p>
                    </div>
                  )}

                  {log.ResolutionStrategy && (
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                      <p className="text-sm font-semibold mb-1 text-green-900 dark:text-green-100">Resolution:</p>
                      <p className="text-sm text-green-800 dark:text-green-200">{log.ResolutionStrategy}</p>
                    </div>
                  )}

                  {log.Commentary && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-semibold mb-1 text-blue-900 dark:text-blue-100">Commentary:</p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">{log.Commentary}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
};


  const renderMaterialLogs = () => (
    <div className="space-y-4">
      {materialLogs.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No material logs yet.</p>
      ) : (
        materialLogs.map(log => (
          <Card key={log.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{log.MaterialNameEN}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {log.Subject} • {log.Status}
                </p>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Progress:</span> {log.ProblemsSolved}/{log.TotalProblems}
                  </div>
                  <div>
                    <span className="font-semibold">Avg Attempts:</span> {log.AvgAttemptsLastBatch?.toFixed(1) || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Last Review:</span>{' '}
                    {log.LastReviewedGMT7 ? new Date(log.LastReviewedGMT7).toLocaleDateString() : 'Never'}
                  </div>
                </div>

                {log.Commentary && (
                  <p className="text-sm mt-3 p-2 bg-muted rounded">{log.Commentary}</p>
                )}
              </div>
              
              <div className="flex gap-2 ml-4">
                <Button onClick={() => handleEdit(log)} variant="ghost" size="sm">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button onClick={() => handleDelete(log.id, 'material')} variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  const renderRussianLogs = () => (
    <div className="space-y-4">
      {russianLogs.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No Russian drilling logs yet.</p>
      ) : (
        russianLogs.map(log => (
          <Card key={log.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-lg">
                  {log.MaterialNameEN} / {log.MaterialNameRU}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Attempt #{log.AttemptNumber} • {log.Status}
                </p>

                {log.ErrorsRU && (
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <p className="text-sm font-semibold mb-1">Ошибки:</p>
                    <p className="text-sm">{log.ErrorsRU}</p>
                  </div>
                )}

                {log.UsedKeywordList && (
                  <p className="text-sm mt-2">
                    <span className="font-semibold">Keywords:</span> {log.UsedKeywordList}
                  </p>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <Button onClick={() => handleEdit(log)} variant="ghost" size="sm">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button onClick={() => handleDelete(log.id, 'russian')} variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">History & Logs</h2>
        <Button onClick={loadAllLogs} variant="outline" size="sm">
          🔄 Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('errors')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'errors'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Error Logs ({errorLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'materials'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Materials ({materialLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('russian')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'russian'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Russian Drilling ({russianLogs.length})
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[600px] overflow-y-auto">
        {activeTab === 'errors' && renderErrorLogs()}
        {activeTab === 'materials' && renderMaterialLogs()}
        {activeTab === 'russian' && renderRussianLogs()}
      </div>
    </Card>
  );
});

HistoryView.displayName = 'HistoryView';
