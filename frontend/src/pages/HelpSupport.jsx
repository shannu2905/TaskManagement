import { Link } from 'react-router-dom';

export default function HelpSupport() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Help & Support</h1>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Welcome to TaskFlow Help & Support. Find quick answers, troubleshooting tips, and ways to contact the team.
          </p>

          <h2 className="text-lg font-medium mt-4 mb-2">Quick Links</h2>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400">
            <li><a className="text-primary-600 hover:underline" href="/README.md">Project README</a> — setup and developer notes.</li>
            <li><a className="text-primary-600 hover:underline" href="/QUICK_START.md">Quick Start</a> — run local dev servers and common commands.</li>
            <li><Link className="text-primary-600 hover:underline" to="/notifications">Notifications</Link> — view recent notifications.</li>
          </ul>

          <h2 className="text-lg font-medium mt-6 mb-2">Frequently Asked Questions</h2>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <div>
              <p className="font-semibold">How do I create a project?</p>
              <p className="text-sm">Use the "Add" button in the top-right and choose "New Project". You can also create from the Dashboard.</p>
            </div>

            <div>
              <p className="font-semibold">Why don't I see calendar events?</p>
              <p className="text-sm">Calendar events are populated from tasks with a due date. Check that the task has a valid due date and that the backend is running. See Troubleshooting below.</p>
            </div>

            <div>
              <p className="font-semibold">How do I invite team members?</p>
              <p className="text-sm">From a project workspace, open Team Settings and invite members by email. The invited user will receive a project invite notification.</p>
            </div>
          </div>

          <h2 className="text-lg font-medium mt-6 mb-2">Troubleshooting</h2>
          <ol className="list-decimal pl-5 text-gray-600 dark:text-gray-400 space-y-2">
            <li>Ensure the backend server is running (start backend with your usual npm script).</li>
            <li>Open the browser console and server logs to inspect errors.</li>
            <li>Check that your access token is present in localStorage (key: <code>accessToken</code>).</li>
            <li>If sockets aren't working, confirm the backend Socket.IO server is up and that you are authenticated.</li>
          </ol>

          <h2 className="text-lg font-medium mt-6 mb-2">Contact</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-2">If you still need help, email the dev team:</p>
          <a className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700" href="mailto:support@example.com">Email Support</a>
        </div>
      </div>
    </div>
  );
}
