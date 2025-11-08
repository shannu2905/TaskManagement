import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import useThemeStore from '../store/themeStore';

const DEFAULT_SETTINGS = {
  organization: { name: '', logo: '', contactEmail: '' },
  appearance: { theme: 'system', accent: 'primary', sidebarCompact: false },
  taskDefaults: { columns: ['todo','in_progress','done'], defaultPriority: 'medium', dueDateRuleDays: 7 },
  users: { defaultRole: 'member', emailVerification: true, sessionTimeoutMins: 120 },
  notifications: { email: true, inApp: true, remindersDaysBefore: 1 },
  dashboard: { showOverdueCard: true, showRecentUsers: true },
  security: { requireStrongPassword: true, twoFA: false },
  system: { maintenanceMode: false, backupEnabled: false }
};

export default function Settings() {
  const [active, setActive] = useState('organization');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('systemSettings');
      if (raw) setSettings(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  const save = () => {
    try {
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      // Apply appearance changes immediately
      try {
        if (settings.appearance?.theme) {
          if (settings.appearance.theme === 'dark') {
            useThemeStore.getState().setDarkMode(true);
          } else if (settings.appearance.theme === 'light') {
            useThemeStore.getState().setDarkMode(false);
          }
        }
        if (settings.appearance?.accent) {
          document.documentElement.dataset.accent = settings.appearance.accent;
        }
      } catch (e) {}
        // Emit a custom event so other parts of the app update in the same tab
        try {
          window.dispatchEvent(new CustomEvent('systemSettings:changed', { detail: settings }));
        } catch (e) {}
        alert('Settings saved');
    } catch (e) {
      alert('Failed to save settings');
    }
  };

  const reset = () => {
    localStorage.removeItem('systemSettings');
    setSettings(DEFAULT_SETTINGS);
    alert('Settings reset');
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure organization, appearance, defaults and system options.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="col-span-1">
          <Card className="p-4">
            <nav className="space-y-2">
              <button className={`w-full text-left px-3 py-2 rounded ${active==='organization' ? 'bg-gray-100 dark:bg-gray-800' : ''}`} onClick={() => setActive('organization')}>🏢 Organization</button>
              <button className={`w-full text-left px-3 py-2 rounded ${active==='appearance' ? 'bg-gray-100 dark:bg-gray-800' : ''}`} onClick={() => setActive('appearance')}>🎨 Appearance</button>
              <button className={`w-full text-left px-3 py-2 rounded ${active==='taskDefaults' ? 'bg-gray-100 dark:bg-gray-800' : ''}`} onClick={() => setActive('taskDefaults')}>⏰ Task Defaults</button>
              <button className={`w-full text-left px-3 py-2 rounded ${active==='users' ? 'bg-gray-100 dark:bg-gray-800' : ''}`} onClick={() => setActive('users')}>👥 User & Role</button>
              <button className={`w-full text-left px-3 py-2 rounded ${active==='notifications' ? 'bg-gray-100 dark:bg-gray-800' : ''}`} onClick={() => setActive('notifications')}>📢 Notifications</button>
              <button className={`w-full text-left px-3 py-2 rounded ${active==='dashboard' ? 'bg-gray-100 dark:bg-gray-800' : ''}`} onClick={() => setActive('dashboard')}>📊 Dashboard</button>
              <button className={`w-full text-left px-3 py-2 rounded ${active==='security' ? 'bg-gray-100 dark:bg-gray-800' : ''}`} onClick={() => setActive('security')}>🕵️ Security</button>
              <button className={`w-full text-left px-3 py-2 rounded ${active==='system' ? 'bg-gray-100 dark:bg-gray-800' : ''}`} onClick={() => setActive('system')}>🔧 System</button>
            </nav>
          </Card>
        </aside>

        <main className="col-span-3">
          <Card className="p-6">
            {active === 'organization' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Organization</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Name</label>
                    <Input value={settings.organization.name} onChange={(e) => setSettings(s=>({ ...s, organization: {...s.organization, name: e.target.value}}))} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Contact Email</label>
                    <Input value={settings.organization.contactEmail} onChange={(e) => setSettings(s=>({ ...s, organization: {...s.organization, contactEmail: e.target.value}}))} />
                  </div>
                </div>
              </div>
            )}

            {active === 'appearance' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Appearance</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Theme</label>
                    <select className="mt-1 w-full px-3 py-2 rounded-xl border" value={settings.appearance.theme} onChange={(e)=>setSettings(s=>({...s, appearance:{...s.appearance, theme: e.target.value}}))}>
                      <option value="system">System</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Accent</label>
                    <select className="mt-1 w-full px-3 py-2 rounded-xl border" value={settings.appearance.accent} onChange={(e)=>setSettings(s=>({...s, appearance:{...s.appearance, accent: e.target.value}}))}>
                      <option value="primary">Primary</option>
                      <option value="purple">Purple</option>
                      <option value="green">Green</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {active === 'taskDefaults' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Task Defaults</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Default Priority</label>
                    <select className="mt-1 w-full px-3 py-2 rounded-xl border" value={settings.taskDefaults.defaultPriority} onChange={(e)=>setSettings(s=>({...s, taskDefaults:{...s.taskDefaults, defaultPriority: e.target.value}}))}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Due date default (days)</label>
                    <Input type="number" value={settings.taskDefaults.dueDateRuleDays} onChange={(e)=>setSettings(s=>({...s, taskDefaults:{...s.taskDefaults, dueDateRuleDays: Number(e.target.value)}}))} />
                  </div>
                </div>
              </div>
            )}

            {active === 'users' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Users & Roles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Default Role</label>
                    <select className="mt-1 w-full px-3 py-2 rounded-xl border" value={settings.users.defaultRole} onChange={(e)=>setSettings(s=>({...s, users:{...s.users, defaultRole: e.target.value}}))}>
                      <option value="member">Member</option>
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email verification</label>
                    <div className="mt-2">
                      <label className="inline-flex items-center">
                        <input type="checkbox" checked={settings.users.emailVerification} onChange={(e)=>setSettings(s=>({...s, users:{...s.users, emailVerification: e.target.checked}}))} />
                        <span className="ml-2 text-sm">Require email verification</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {active === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Notifications</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Email notifications</label>
                    <div className="mt-2">
                      <label className="inline-flex items-center">
                        <input type="checkbox" checked={settings.notifications.email} onChange={(e)=>setSettings(s=>({...s, notifications:{...s.notifications, email: e.target.checked}}))} />
                        <span className="ml-2 text-sm">Enable email alerts</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">In-app notifications</label>
                    <div className="mt-2">
                      <label className="inline-flex items-center">
                        <input type="checkbox" checked={settings.notifications.inApp} onChange={(e)=>setSettings(s=>({...s, notifications:{...s.notifications, inApp: e.target.checked}}))} />
                        <span className="ml-2 text-sm">Enable in-app alerts</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {active === 'dashboard' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="inline-flex items-center"><input type="checkbox" checked={settings.dashboard.showOverdueCard} onChange={(e)=>setSettings(s=>({...s, dashboard:{...s.dashboard, showOverdueCard: e.target.checked}}))} /><span className="ml-2">Show overdue tasks card</span></label>
                  <label className="inline-flex items-center"><input type="checkbox" checked={settings.dashboard.showRecentUsers} onChange={(e)=>setSettings(s=>({...s, dashboard:{...s.dashboard, showRecentUsers: e.target.checked}}))} /><span className="ml-2">Show recent users</span></label>
                </div>
              </div>
            )}

            {active === 'security' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Security</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="inline-flex items-center"><input type="checkbox" checked={settings.security.requireStrongPassword} onChange={(e)=>setSettings(s=>({...s, security:{...s.security, requireStrongPassword: e.target.checked}}))} /><span className="ml-2">Require strong passwords</span></label>
                  <label className="inline-flex items-center"><input type="checkbox" checked={settings.security.twoFA} onChange={(e)=>setSettings(s=>({...s, security:{...s.security, twoFA: e.target.checked}}))} /><span className="ml-2">Enable 2FA</span></label>
                </div>
              </div>
            )}

            {active === 'system' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">System</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="inline-flex items-center"><input type="checkbox" checked={settings.system.maintenanceMode} onChange={(e)=>setSettings(s=>({...s, system:{...s.system, maintenanceMode: e.target.checked}}))} /><span className="ml-2">Maintenance mode</span></label>
                  <label className="inline-flex items-center"><input type="checkbox" checked={settings.system.backupEnabled} onChange={(e)=>setSettings(s=>({...s, system:{...s.system, backupEnabled: e.target.checked}}))} /><span className="ml-2">Enable backups</span></label>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <Button onClick={save}>Save</Button>
              <Button variant="secondary" onClick={reset}>Reset</Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
