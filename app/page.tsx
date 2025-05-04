// Habit Tracker App

'use client';
import { useState, useEffect } from 'react';
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Settings, Bell, X, Moon, Droplet, Monitor, Plus, Check, Calendar, Award, Edit, Trash2, ChevronRight, ChevronDown, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import _ from 'lodash';

// Types
interface Habit {
  id: string;
  name: string;
  category: 'sleep' | 'water' | 'screen' | 'exercise' | 'meditation' | 'custom';
  icon: string;
  target: number;
  unit: string;
  currentStreak: number;
  bestStreak: number;
  color: 'indigo' | 'blue' | 'pink' | 'emerald' | 'purple';
  progress: number;
  history: {
    date: string;
    value: number;
  }[];
}

interface Reminder {
  id: string;
  habitId: string;
  time: string;
  days: string[];
  enabled: boolean;
}

// Mock data
const generateMockData = (): Habit[] => {
  const today = new Date();
  
  const generateHistory = (days: number, minValue: number, maxValue: number, target: number) => {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - (days - i - 1));
      const dateStr = date.toISOString().split('T')[0];
      
      // Produce more realistic data with trends
      let value;
      if (i < days * 0.3) {
        // Start lower
        value = minValue + Math.random() * (target - minValue) * 0.7;
      } else if (i > days * 0.7) {
        // End higher (improvement)
        value = target - Math.random() * (target - minValue) * 0.3;
      } else {
        // Middle - more variance
        value = minValue + Math.random() * (maxValue - minValue);
      }
      
      return {
        date: dateStr,
        value: Math.round(value * 10) / 10
      };
    });
  };

  return [
    {
      id: '1',
      name: 'Sleep',
      category: 'sleep',
      icon: 'Moon',
      target: 8,
      unit: 'hours',
      currentStreak: 5,
      bestStreak: 14,
      color: 'indigo',
      progress: 0.85,
      history: generateHistory(14, 5.5, 9, 8)
    },
    {
      id: '2',
      name: 'Water Intake',
      category: 'water',
      icon: 'Droplet',
      target: 8,
      unit: 'glasses',
      currentStreak: 3,
      bestStreak: 10,
      color: 'blue',
      progress: 0.625,
      history: generateHistory(14, 4, 9, 8)
    },
    {
      id: '3',
      name: 'Screen Time',
      category: 'screen',
      icon: 'Monitor',
      target: 2,
      unit: 'hours',
      currentStreak: 0,
      bestStreak: 7,
      color: 'pink',
      progress: 0.3,
      history: generateHistory(14, 1.5, 4.5, 2)
    },
    {
      id: '4',
      name: 'Exercise',
      category: 'exercise',
      icon: 'Award',
      target: 30,
      unit: 'minutes',
      currentStreak: 2,
      bestStreak: 8,
      color: 'emerald',
      progress: 0.5,
      history: generateHistory(14, 0, 45, 30)
    },
    {
      id: '5',
      name: 'Meditation',
      category: 'meditation',
      icon: 'Moon',
      target: 10,
      unit: 'minutes',
      currentStreak: 4,
      bestStreak: 12,
      color: 'purple',
      progress: 0.7,
      history: generateHistory(14, 0, 15, 10)
    }
  ];
};

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Moon': return <Moon />;
    case 'Droplet': return <Droplet />;
    case 'Monitor': return <Monitor />;
    case 'Award': return <Award />;
    default: return <Moon />;
  }
};

const colorMap = {
  'indigo': 'bg-indigo-500 text-indigo-50',
  'blue': 'bg-blue-500 text-blue-50',
  'pink': 'bg-pink-500 text-pink-50',
  'emerald': 'bg-emerald-500 text-emerald-50',
  'purple': 'bg-purple-500 text-purple-50',
};

const getColorClass = (color: keyof typeof colorMap) => {
  return colorMap[color] || 'bg-gray-500 text-gray-50';
};

const getBgColorClass = (color: keyof typeof colorMap) => {
  const colorMap = {
    'indigo': 'bg-indigo-100',
    'blue': 'bg-blue-100',
    'pink': 'bg-pink-100',
    'emerald': 'bg-emerald-100',
    'purple': 'bg-purple-100',
  };
  
  return colorMap[color] || 'bg-gray-100';
};

const getTextColorClass = (color: keyof typeof colorMap) => {
  const colorMap = {
    'indigo': 'text-indigo-500',
    'blue': 'text-blue-500',
    'pink': 'text-pink-500',
    'emerald': 'text-emerald-500',
    'purple': 'text-purple-500',
  };
  
  return colorMap[color] || 'text-gray-500';
};

const getChartColor = (color: keyof typeof colorMap) => {
  const colorMap = {
    'indigo': '#6366f1',
    'blue': '#3b82f6',
    'pink': '#ec4899',
    'emerald': '#10b981',
    'purple': '#a855f7',
  };
  
  return colorMap[color] || '#6b7280';
};

// AddHabitModal Component
function AddHabitModal({ 
  onClose, 
  onAdd 
}: { 
  onClose: () => void, 
  onAdd: (habit: Omit<Habit, 'id' | 'history' | 'progress' | 'currentStreak' | 'bestStreak'>) => void 
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Habit['category']>('custom');
  const [icon, setIcon] = useState('Moon');
  const [target, setTarget] = useState(1);
  const [unit, setUnit] = useState('times');
  const [color, setColor] = useState<Habit['color']>('indigo');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name,
      category,
      icon,
      target,
      unit,
      color
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold">Add New Habit</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Habit Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Drinking Water"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Habit['category'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="sleep">Sleep</option>
              <option value="water">Water</option>
              <option value="screen">Screen Time</option>
              <option value="exercise">Exercise</option>
              <option value="meditation">Meditation</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Icon</label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Moon">Moon</option>
              <option value="Droplet">Droplet</option>
              <option value="Monitor">Monitor</option>
              <option value="Award">Award</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Target</label>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                required
                min="0.1"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., glasses, hours"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <div className="flex space-x-2">
              {(['indigo', 'blue', 'pink', 'emerald', 'purple'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full ${
                    getColorClass(c)
                  } ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              Add Habit
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// Settings Modal Component
function SettingsModal({ onClose }: { onClose: () => void }) {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [pushNotifications, setPushNotifications] = useState<boolean>(false);
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedPushNotifications = localStorage.getItem('pushNotifications') === 'true';
    
    setDarkMode(savedDarkMode);
    setPushNotifications(savedPushNotifications);
    
    // Apply dark mode if it's enabled
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  // Toggle dark mode
  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Toggle push notifications
  const handlePushNotificationsToggle = async () => {
    const newPushNotifications = !pushNotifications;
    
    if (newPushNotifications) {
      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setPushNotifications(true);
          localStorage.setItem('pushNotifications', 'true');
          // Show a test notification
          new Notification('HabitFlow', {
            body: 'Notifications enabled successfully!',
            icon: '/favicon.ico'
          });
        } else {
          // If permission denied, keep it off
          setPushNotifications(false);
          localStorage.setItem('pushNotifications', 'false');
          alert('Please allow notifications to enable this feature');
        }
      } else {
        alert('Your browser does not support notifications');
        setPushNotifications(false);
        localStorage.setItem('pushNotifications', 'false');
      }
    } else {
      // Turn off notifications
      setPushNotifications(false);
      localStorage.setItem('pushNotifications', 'false');
    }
  };
  
  const handleSaveChanges = () => {
    // All changes are already saved when toggled
    onClose();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 dark:text-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold">Settings</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <h4 className="font-medium">Appearance</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Moon className="w-5 h-5 text-gray-500" />
                <span>Dark Mode</span>
              </div>
              <button 
                onClick={handleDarkModeToggle}
                className={`px-3 py-1 rounded-md transition-colors ${
                  darkMode 
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-600 dark:text-indigo-100' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {darkMode ? 'On' : 'Off'}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Notifications</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-500" />
                <span>Push Notifications</span>
              </div>
              <button 
                onClick={handlePushNotificationsToggle}
                className={`px-3 py-1 rounded-md transition-colors ${
                  pushNotifications 
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-600 dark:text-indigo-100' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {pushNotifications ? 'On' : 'Off'}
              </button>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Reminders Modal Component
function RemindersModal({ onClose, habits }: { onClose: () => void, habits: Habit[] }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showAddReminderForm, setShowAddReminderForm] = useState(false);
  const [time, setTime] = useState('08:00');
  const [days, setDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  
  // Load reminders from localStorage on component mount
  useEffect(() => {
    const savedReminders = localStorage.getItem('habitReminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
  }, []);

  // Save reminders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('habitReminders', JSON.stringify(reminders));
  }, [reminders]);
  
  const handleAddReminder = (habit: Habit) => {
    setSelectedHabit(habit);
    setShowAddReminderForm(true);
    setTime('08:00');
    setDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    setEditingReminderId(null);
  };
  
  const handleEditReminder = (reminder: Reminder) => {
    const habit = habits.find(h => h.id === reminder.habitId);
    if (habit) {
      setSelectedHabit(habit);
      setShowAddReminderForm(true);
      setTime(reminder.time);
      setDays(reminder.days);
      setEditingReminderId(reminder.id);
    }
  };
  
  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };
  
  const handleSaveReminder = () => {
    if (!selectedHabit) return;
    
    if (editingReminderId) {
      // Update existing reminder
      setReminders(prev => prev.map(reminder => 
        reminder.id === editingReminderId 
          ? { ...reminder, time, days, habitId: selectedHabit.id } 
          : reminder
      ));
    } else {
      // Add new reminder
      const newReminder: Reminder = {
        id: `reminder-${Date.now()}`,
        habitId: selectedHabit.id,
        time,
        days,
        enabled: true
      };
      setReminders(prev => [...prev, newReminder]);
    }
    
    setShowAddReminderForm(false);
    setSelectedHabit(null);
  };
  
  const toggleReminderEnabled = (id: string) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === id ? { ...reminder, enabled: !reminder.enabled } : reminder
    ));
  };
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold">Reminders</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {showAddReminderForm && selectedHabit ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-lg ${getColorClass(selectedHabit.color)}`}>
                {getIconComponent(selectedHabit.icon)}
              </div>
              <h4 className="font-medium">{selectedHabit.name}</h4>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Time</label>
                <input 
                  type="time" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Repeat on days</label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        if (days.includes(day)) {
                          setDays(days.filter(d => d !== day));
                        } else {
                          setDays([...days, day]);
                        }
                      }}
                      className={`px-3 py-1 text-sm rounded-md ${
                        days.includes(day)
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowAddReminderForm(false);
                  setSelectedHabit(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReminder}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
              >
                {editingReminderId ? 'Update Reminder' : 'Add Reminder'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {habits.map(habit => {
              const habitReminders = reminders.filter(r => r.habitId === habit.id);
              
              return (
                <div key={habit.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getColorClass(habit.color)}`}>
                        {getIconComponent(habit.icon)}
                      </div>
                      <span className="font-medium">{habit.name}</span>
                    </div>
                    <button 
                      onClick={() => handleAddReminder(habit)}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm"
                    >
                      Add Reminder
                    </button>
                  </div>
                  
                  {habitReminders.length > 0 && (
                    <div className="mt-2 pl-10 space-y-2">
                      {habitReminders.map(reminder => (
                        <div key={reminder.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Bell className={`w-4 h-4 ${reminder.enabled ? 'text-indigo-500' : 'text-gray-400'}`} />
                              <span className="font-medium">{reminder.time}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {reminder.days.join(', ')}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleReminderEnabled(reminder.id)}
                              className={`p-1 rounded-md ${
                                reminder.enabled ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {reminder.enabled ? 'On' : 'Off'}
                            </button>
                            <button
                              onClick={() => handleEditReminder(reminder)}
                              className="p-1 rounded-md hover:bg-gray-200"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteReminder(reminder.id)}
                              className="p-1 rounded-md hover:bg-gray-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {reminders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No reminders set yet</p>
                <p className="text-sm mt-1">Add reminders to help build your habits</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Habit Details Modal Component
function HabitDetailsModal({ 
  habit, 
  onClose,
  onUpdateProgress
}: { 
  habit: Habit, 
  onClose: () => void,
  onUpdateProgress: (id: string, value: number) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className={`p-6 ${getBgColorClass(habit.color)}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getColorClass(habit.color)}`}>
                {getIconComponent(habit.icon)}
              </div>
              <h3 className="text-xl font-bold">{habit.name}</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500 text-sm">Daily Target</p>
              <p className="text-xl font-bold">{habit.target} {habit.unit}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500 text-sm">Current Streak</p>
              <p className="text-xl font-bold">{habit.currentStreak} days</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500 text-sm">Best Streak</p>
              <p className="text-xl font-bold">{habit.bestStreak} days</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Progress History</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={habit.history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    return new Date(date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    });
                  }}
                />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={getChartColor(habit.color)} 
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey={() => habit.target}
                  stroke="#ddd"
                  strokeDasharray="5 5"
                  name="Target"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Main App Component
export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  
  
  // Generate mock data on initial load
  useEffect(() => {
    setTimeout(() => {
      setHabits(generateMockData());
      setIsLoading(false);
    }, 800);
  }, []);
  
  // Update progress for today
  const handleUpdateProgress = (habitId: string, value: number) => {
    setHabits(prev => 
      prev.map(habit => {
        if (habit.id === habitId) {
          const today = new Date().toISOString().split('T')[0];
          const updatedHistory = [...habit.history];
          const todayIndex = updatedHistory.findIndex(h => h.date === today);
          
          if (todayIndex >= 0) {
            updatedHistory[todayIndex].value = value;
          } else {
            updatedHistory.push({ date: today, value });
          }
          
          const progress = value / habit.target;
          return {
            ...habit,
            progress: Math.min(progress, 1), // Cap at 100%
            history: updatedHistory
          };
        }
        return habit;
      })
    );
  };
  
  // Show habit details
  const handleViewDetails = (habit: Habit) => {
    setSelectedHabit(habit);
    setShowDetailsModal(true);
  };
  
  // Add a new habit
  const handleAddHabit = (newHabit: Omit<Habit, 'id' | 'history' | 'progress' | 'currentStreak' | 'bestStreak'>) => {
    const id = (habits.length + 1).toString();
    const today = new Date().toISOString().split('T')[0];
    
    const habit: Habit = {
      id,
      ...newHabit,
      progress: 0,
      currentStreak: 0,
      bestStreak: 0,
      history: [{ date: today, value: 0 }]
    };
    
    setHabits(prev => [...prev, habit]);
    setShowAddHabit(false);
  };
  
  // Weekly average calculation
  const getWeeklyAverage = (habit: Habit) => {
    const lastSevenDays = habit.history.slice(-7);
    return _.meanBy(lastSevenDays, 'value').toFixed(1);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* App Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <motion.div 
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center"
            >
              <Chart className="w-5 h-5" />
            </motion.div>
            <h1 className="text-xl font-bold">HabitFlow</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowReminders(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="bg-white shadow-sm mt-1">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard' 
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics' 
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'calendar' 
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <LoadingScreen />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard 
                habits={habits} 
                onUpdateProgress={handleUpdateProgress} 
                onViewDetails={handleViewDetails}
                onAddHabitClick={() => setShowAddHabit(true)}
                getWeeklyAverage={getWeeklyAverage}
              />
            )}
            
            {activeTab === 'analytics' && (
              <Analytics habits={habits} />
            )}
            
            {activeTab === 'calendar' && (
              <CalendarView habits={habits} />
            )}
          </>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded-md bg-indigo-500 text-white flex items-center justify-center">
                <Chart className="w-4 h-4" />
              </div>
              <span className="font-medium">HabitFlow</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-indigo-500 text-sm">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-indigo-500 text-sm">Terms</a>
              <a href="#" className="text-gray-500 hover:text-indigo-500 text-sm">Help</a>
              <a href="#" className="text-gray-500 hover:text-indigo-500 text-sm">Contact</a>
            </div>
          </div>
          <div className="mt-6 text-center text-gray-400 text-sm">
            © 2025 HabitFlow. All rights reserved.
          </div>
        </div>
      </footer>
      
      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAddHabit && (
          <AddHabitModal onClose={() => setShowAddHabit(false)} onAdd={handleAddHabit} />
        )}
      </AnimatePresence>
      
      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
      
      {/* Reminders Modal */}
      <AnimatePresence>
        {showReminders && (
          <RemindersModal onClose={() => setShowReminders(false)} habits={habits} />
        )}
      </AnimatePresence>
      
      {/* Habit Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedHabit && (
          <HabitDetailsModal 
            habit={selectedHabit} 
            onClose={() => setShowDetailsModal(false)} 
            onUpdateProgress={handleUpdateProgress}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Chart Component for displaying habit data
function Chart({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  );
}

// Loading Screen
function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-indigo-500"
      />
      <p className="mt-4 text-gray-500">Loading your habits...</p>
    </div>
  );
}

// Dashboard Component
function Dashboard({ 
  habits, 
  onUpdateProgress, 
  onViewDetails,
  onAddHabitClick,
  getWeeklyAverage
}: { 
  habits: Habit[], 
  onUpdateProgress: (id: string, value: number) => void,
  onViewDetails: (habit: Habit) => void,
  onAddHabitClick: () => void,
  getWeeklyAverage: (habit: Habit) => string
}) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  // Calculate completion percentage for today
  const completedToday = habits.filter(h => h.progress >= 1).length;
  const completionPercentage = habits.length > 0 ? (completedToday / habits.length) * 100 : 0;
  
  return (
    <div className="space-y-8">
      {/* Today's Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h2 className="text-2xl font-bold">{today}</h2>
            <p className="text-gray-500 mt-1 ">Track your daily progress</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-indigo-500 rounded-full"
                />
              </div>
              <span className="text-sm font-medium">{Math.round(completionPercentage)}% Done</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{completedToday} of {habits.length} habits completed</p>
          </div>
        </div>
      </div>
      
      {/* Habit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map(habit => (
          <motion.div
            key={habit.id}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className={`p-4 flex justify-between items-center ${getBgColorClass(habit.color)}`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getColorClass(habit.color)}`}>
                  {getIconComponent(habit.icon)}
                </div>
                <h3 className="font-medium">{habit.name}</h3>
              </div>
              <button 
                onClick={() => onViewDetails(habit)}
                className="p-1 rounded-full hover:bg-white/30 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-3 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Daily Target</p>
                  <p className="font-medium">{habit.target} {habit.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Weekly Avg</p>
                  <p className="font-medium">{getWeeklyAverage(habit)} {habit.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Streak</p>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">{habit.currentStreak}</span>
                    <span className="text-xs text-gray-400">days</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Today's Progress</span>
                  <span className={habit.progress >= 1 ? "text-green-500" : "text-gray-500"}>
                    {Math.round(habit.progress * 100)}%
                  </span>
                </div>
                
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${habit.progress * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full ${habit.progress >= 1 ? 'bg-green-500' : getTextColorClass(habit.color)}`}
                  />
                </div>
                
                <div className="pt-2">
                  <input
                    type="range"
                    min="0"
                    max={habit.target * 1.5}
                    step={habit.unit === 'minutes' ? 5 : 0.5}
                    value={habit.history[habit.history.length - 1]?.value || 0}
                    onChange={(e) => onUpdateProgress(habit.id, parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>0</span>
                    <span>{habit.target}</span>
                    <span>{habit.target * 1.5}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Add Habit Card */}
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={onAddHabitClick}
          className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center cursor-pointer h-full min-h-64"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-indigo-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800">Add New Habit</h3>
          <p className="text-gray-500 text-sm text-center mt-2">
            Track a new daily habit or activity
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// Calendar View Component
function CalendarView({ habits }: { habits: Habit[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Generate calendar days for the month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const firstDay = new Date(year, month, 1).getDay();
    const days = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: '', date: null });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      days.push({ 
        day, 
        date: dateString,
        habitData: habits.map(habit => {
          const entry = habit.history.find(h => h.date === dateString);
          return {
            habitId: habit.id,
            completed: entry && entry.value >= habit.target,
            progress: entry ? entry.value / habit.target : 0,
            color: habit.color
          };
        })
      });
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Habit Calendar</h2>
          <div className="flex items-center space-x-4">
            <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-100">
              <ChevronRight className="w-5 h-5 transform rotate-180" />
            </button>
            <h3 className="text-lg font-medium">{monthName}</h3>
            <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-100">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium text-gray-500 py-2 text-sm">
              {day}
            </div>
          ))}
          
          {days.map((day, i) => (
            <div 
              key={i} 
              className={`aspect-square p-2 rounded-lg ${
                day.date ? 'bg-white border border-gray-100 hover:border-gray-300 transition-colors' : ''
              }`}
            >
              {day.day && (
                <>
                  <div className="text-sm mb-1">{day.day}</div>
                  <div className="flex flex-wrap gap-1">
                    {day.habitData?.map((habit) => (
                      <div 
                        key={habit.habitId}
                        className={`w-2 h-2 rounded-full ${
                          habit.completed 
                            ? `bg-${habit.color}-500` 
                            : habit.progress > 0 
                              ? `bg-${habit.color}-200` 
                              : 'bg-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4">Monthly Summary</h3>
        <div className="space-y-4">
          {habits.map(habit => (
            <div key={habit.id} className="flex items-center space-x-4">
              <div className={`p-2 rounded-lg ${getColorClass(habit.color)}`}>
                {getIconComponent(habit.icon)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{habit.name}</h4>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                  <div 
                    className={`h-full ${getTextColorClass(habit.color)}`}
                    style={{ 
                      width: `${
                        (habit.history.filter(h => {
                          const date = new Date(h.date);
                          return date.getMonth() === currentMonth.getMonth() && 
                                 date.getFullYear() === currentMonth.getFullYear() && 
                                 h.value >= habit.target;
                        }).length / 
                        days.filter(d => d.date !== null).length) * 100
                      }%` 
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Analytics Component
function Analytics({ habits }: { habits: Habit[] }) {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const filteredHabits = habits.filter(habit => 
    selectedCategory === 'all' || habit.category === selectedCategory
  );
  
  // Process data for charts
  const getChartData = () => {
    const days = selectedPeriod === 'week' ? 7 : 30;
    
    // Get the last N days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);
    
    // Create array of date strings
    const dateRange = Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return date.toISOString().split('T')[0];
    });
    
    // Aggregate data by date
    return dateRange.map(date => {
      const result: { date: string; [habitName: string]: string | number } = { date };
      
      filteredHabits.forEach(habit => {
        const entry = habit.history.find(h => h.date === date);
        result[habit.name] = entry ? (entry.value / habit.target) * 100 : 0;
      });
      
      return result;
    });
  };
  
  const chartData = getChartData();
  
  // Calculate completion rates for each habit
  const completionRates = habits.map(habit => {
    const completedDays = habit.history.filter(day => day.value >= habit.target).length;
    const totalDays = habit.history.length;
    return {
      name: habit.name,
      rate: totalDays > 0 ? (completedDays / totalDays) * 100 : 0,
      color: getChartColor(habit.color)
    };
  });
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Performance Analytics</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedPeriod === 'week' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedPeriod === 'month' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Month
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedCategory === 'all' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              All
            </button>
            {Array.from(new Set(habits.map(h => h.category))).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 text-sm rounded-md ${
                  selectedCategory === category 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    return new Date(date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    });
                  }}
                />
                <YAxis 
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                />
                <Tooltip 
                  formatter={(value) => [`${Math.round(Number(value))}%`, '']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric' 
                  })}
                />
                <Legend />
                {filteredHabits.map((habit, index) => (
                  <Line 
                    key={habit.id}
                    type="monotone"
                    dataKey={habit.name}
                    stroke={getChartColor(habit.color)}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4">Completion Rates</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionRates}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                />
                <Tooltip 
                  formatter={(value) => [`${Math.round(Number(value))}%`, 'Completion Rate']}
                />
                <Bar 
                  dataKey="rate" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                >
                  {completionRates.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4">Streak Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={habits}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="currentStreak" name="Current Streak" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                <Bar dataKey="bestStreak" name="Best Streak" fill="#a855f7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}