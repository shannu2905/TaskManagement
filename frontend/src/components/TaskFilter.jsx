import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export default function TaskFilter({ filters, onFilterChange, onSearchChange, availableAssignees = [] }) {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters || {
    status: '',
    priority: '',
    assignee: '',
    dueDateFrom: '',
    dueDateTo: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  const clearFilters = () => {
    const emptyFilters = {
      status: '',
      priority: '',
      assignee: '',
      dueDateFrom: '',
      dueDateTo: ''
    };
    setLocalFilters(emptyFilters);
    setSearchQuery('');
    onFilterChange(emptyFilters);
    onSearchChange('');
  };

  const activeFiltersCount = Object.values(localFilters).filter(v => v !== '').length + (searchQuery ? 1 : 0);

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Toggle Button */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={localFilters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={localFilters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Assignee Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assignee
              </label>
              <select
                value={localFilters.assignee}
                onChange={(e) => handleFilterChange('assignee', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Assignees</option>
                <option value="unassigned">Unassigned</option>
                {availableAssignees.map((assignee) => (
                  <option key={assignee._id} value={assignee._id}>
                    {assignee.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date From
              </label>
              <Input
                type="date"
                value={localFilters.dueDateFrom}
                onChange={(e) => handleFilterChange('dueDateFrom', e.target.value)}
              />
            </div>

            {/* Due Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date To
              </label>
              <Input
                type="date"
                value={localFilters.dueDateTo}
                onChange={(e) => handleFilterChange('dueDateTo', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

