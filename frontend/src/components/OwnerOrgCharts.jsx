import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function OwnerOrgCharts({ stats }) {
  const usersByRole = stats?.usersByRole || {};
  const tasksByStatus = stats?.tasksByStatus || {};
  const tasksPerMonth = stats?.tasksPerMonth || [];

  const roleLabels = Object.keys(usersByRole);
  const roleData = roleLabels.map(k => usersByRole[k] || 0);

  const statusLabels = ['todo', 'in_progress', 'done'];
  const statusData = statusLabels.map(l => tasksByStatus[l] || 0);

  const monthLabels = tasksPerMonth.map(m => m._id);
  const monthData = tasksPerMonth.map(m => m.count);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Users by Role</h4>
        <Pie data={{ labels: roleLabels, datasets: [{ data: roleData, backgroundColor: ['#F6AD55','#9F7AEA','#60A5FA'] }] }} />
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Tasks by Status</h4>
        <Bar data={{ labels: statusLabels, datasets: [{ label: 'Tasks', data: statusData, backgroundColor: ['#A0AEC0','#60A5FA','#48BB78'] }] }} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>

      <div className="md:col-span-2 p-4 bg-white dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Tasks Created (last months)</h4>
        <Bar data={{ labels: monthLabels, datasets: [{ label: 'Tasks Created', data: monthData, backgroundColor: '#7C3AED' }] }} options={{ responsive: true }} />
      </div>
    </div>
  );
}
