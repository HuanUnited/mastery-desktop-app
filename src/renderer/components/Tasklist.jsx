import { useState, useEffect } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Card } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Calendar } from './ui/calendar';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export const Tasklist = () => {
  const { getTasks, addTask, toggleTask, deleteTask } = useDatabase();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await getTasks();
    setTasks(data);
  };

  const handleAdd = async () => {
    if (!newTask.trim()) return;
    
    await addTask({ 
      task: newTask, 
      priority, 
      deadline: deadline ? deadline.toISOString() : null 
    });
    
    setNewTask('');
    setPriority('medium');
    setDeadline(null);
    loadTasks();
  };

  const handleToggle = async (id) => {
    await toggleTask(id);
    loadTasks();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this task?')) {
      await deleteTask(id);
      loadTasks();
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'border-l-4 border-red-500';
      case 'medium': return 'border-l-4 border-yellow-500';
      case 'low': return 'border-l-4 border-green-500';
      default: return '';
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '';
    }
  };

  const isOverdue = (deadlineStr) => {
    if (!deadlineStr) return false;
    return new Date(deadlineStr) < new Date();
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">📋 Tasks</h3>
      
      {/* Add Task Form */}
      <div className="space-y-3 mb-6">
        <div>
          <Input 
            placeholder="New task..." 
            value={newTask} 
            onChange={e => setNewTask(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleAdd()}
          />
        </div>
        
        <div className="flex gap-2">
          {/* Priority Dropdown */}
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">🔴 High</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="low">🟢 Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex-1 justify-start text-left">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {deadline ? format(deadline, "MMM d, yyyy") : "Deadline"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={deadline}
                onSelect={setDeadline}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={handleAdd} className="w-full">
          Add Task
        </Button>
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tasks yet. Add one above!
          </p>
        ) : (
          tasks.map(task => (
            <div 
              key={task.id} 
              className={`flex items-start gap-3 p-3 rounded-lg bg-muted/50 ${getPriorityColor(task.priority)} transition-all hover:bg-muted`}
            >
              <Checkbox 
                checked={task.completed === 1}
                onCheckedChange={() => handleToggle(task.id)}
                className="mt-1"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <span className="text-sm">{getPriorityBadge(task.priority)}</span>
                  <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.task}
                  </p>
                </div>
                
                {task.deadline && (
                  <p className={`text-xs mt-1 ${
                    task.completed 
                      ? 'text-muted-foreground' 
                      : isOverdue(task.deadline) 
                        ? 'text-red-500 font-semibold'
                        : 'text-muted-foreground'
                  }`}>
                    📅 {format(new Date(task.deadline), "MMM d, yyyy")}
                    {isOverdue(task.deadline) && !task.completed && ' (Overdue!)'}
                  </p>
                )}
              </div>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleDelete(task.id)}
                className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Task Summary */}
      {tasks.length > 0 && (
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>{tasks.filter(t => t.completed === 1).length} completed</span>
            <span>{tasks.filter(t => t.completed === 0).length} remaining</span>
          </div>
        </div>
      )}
    </Card>
  );
};
