import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'
import { FiPlus, FiCalendar, FiTag, FiCheck, FiTrash2, FiEdit2 } from 'react-icons/fi'
import './App.css'

type Priority = 'low' | 'medium' | 'high'

interface Task {
  id: string
  title: string
  description?: string
  dueDate?: Date
  priority: Priority
  completed: boolean
  tags: string[]
  subtasks: Subtask[]
}

interface Subtask {
  id: string
  title: string
  completed: boolean
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium')
  const [newTaskTags, setNewTaskTags] = useState('')
  const [activeView, setActiveView] = useState<'today' | 'upcoming' | 'all' | 'completed'>('today')
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  const addTask = () => {
    if (!newTaskTitle.trim()) return

    const newTask: Task = {
      id: uuidv4(),
      title: newTaskTitle,
      description: newTaskDescription,
      dueDate: newTaskDueDate ? new Date(newTaskDueDate) : undefined,
      priority: newTaskPriority,
      completed: false,
      tags: newTaskTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      subtasks: []
    }

    setTasks([...tasks, newTask])
    resetNewTaskFields()
  }

  const resetNewTaskFields = () => {
    setNewTaskTitle('')
    setNewTaskDescription('')
    setNewTaskDueDate('')
    setNewTaskPriority('medium')
    setNewTaskTags('')
  }

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id)
    setNewTaskTitle(task.title)
    setNewTaskDescription(task.description || '')
    setNewTaskDueDate(task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : '')
    setNewTaskPriority(task.priority)
    setNewTaskTags(task.tags.join(', '))
  }

  const saveEditedTask = () => {
    if (!editingTaskId || !newTaskTitle.trim()) return

    setTasks(tasks.map(task => 
      task.id === editingTaskId ? {
        ...task,
        title: newTaskTitle,
        description: newTaskDescription,
        dueDate: newTaskDueDate ? new Date(newTaskDueDate) : undefined,
        priority: newTaskPriority,
        tags: newTaskTags.split(',').map(tag => tag.trim()).filter(tag => tag)
      } : task
    ))

    setEditingTaskId(null)
    resetNewTaskFields()
  }

  const filteredTasks = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (activeView) {
      case 'today':
        return tasks.filter(task => 
          !task.completed && 
          task.dueDate && 
          task.dueDate.toDateString() === today.toDateString()
        )
      case 'upcoming':
        return tasks.filter(task => 
          !task.completed && 
          task.dueDate && 
          task.dueDate > today
        ).sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0))
      case 'all':
        return tasks.filter(task => !task.completed)
      case 'completed':
        return tasks.filter(task => task.completed)
      default:
        return tasks
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>TodoFlow</h1>
        <div className="quick-add">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (editingTaskId ? saveEditedTask() : addTask())}
          />
          <button onClick={editingTaskId ? saveEditedTask : addTask}>
            <FiPlus />
          </button>
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <nav>
            <ul>
              <li className={activeView === 'today' ? 'active' : ''} onClick={() => setActiveView('today')}>Today</li>
              <li className={activeView === 'upcoming' ? 'active' : ''} onClick={() => setActiveView('upcoming')}>Upcoming</li>
              <li className={activeView === 'all' ? 'active' : ''} onClick={() => setActiveView('all')}>All Tasks</li>
              <li className={activeView === 'completed' ? 'active' : ''} onClick={() => setActiveView('completed')}>Completed</li>
            </ul>
          </nav>
        </aside>

        <main className="task-list">
          {filteredTasks().length === 0 ? (
            <div className="empty-state">
              <p>No tasks found. Add a new task to get started!</p>
            </div>
          ) : (
            filteredTasks().map(task => (
              <div key={task.id} className={`task-card ${task.priority}`}>
                <div className="task-header">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id)}
                  />
                  <h3>{task.title}</h3>
                  <div className="task-actions">
                    <button onClick={() => startEditingTask(task)}>
                      <FiEdit2 />
                    </button>
                    <button onClick={() => deleteTask(task.id)}>
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                
                {task.description && <p className="task-description">{task.description}</p>}
                
                <div className="task-meta">
                  {task.dueDate && (
                    <span className="due-date">
                      <FiCalendar /> {format(task.dueDate, 'MMM dd, yyyy')}
                    </span>
                  )}
                  
                  {task.tags.length > 0 && (
                    <div className="tags">
                      <FiTag />
                      {task.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                
                {task.subtasks.length > 0 && (
                  <div className="subtasks">
                    {task.subtasks.map(subtask => (
                      <div key={subtask.id} className="subtask">
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={() => {}}
                        />
                        <span>{subtask.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </main>
      </div>

      <div className="task-form">
        <h3>{editingTaskId ? 'Edit Task' : 'Add Task Details'}</h3>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Task title"
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            placeholder="Task description"
          />
        </div>
        <div className="form-group">
          <label>Due Date</label>
          <input
            type="date"
            value={newTaskDueDate}
            onChange={(e) => setNewTaskDueDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Priority</label>
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="form-group">
          <label>Tags (comma separated)</label>
          <input
            type="text"
            value={newTaskTags}
            onChange={(e) => setNewTaskTags(e.target.value)}
            placeholder="work, personal, urgent"
          />
        </div>
      </div>
    </div>
  )
}

export default App
