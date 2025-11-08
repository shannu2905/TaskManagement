import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import useProjectStore from '../store/projectStore';
import useTaskStore from '../store/taskStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Mail, MessageSquare, Users, Crown, Loader2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import getSocket from '../lib/socket';
import toast from 'react-hot-toast';

export default function ProjectWorkspace() {
  const { id } = useParams();
  const { currentProject, fetchProject, loading: projectLoading } = useProjectStore();
  const { tasks, fetchTasks, updateTask } = useTaskStore();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    fetchProject(id);
    fetchTasks(id);
  }, [id, fetchProject, fetchTasks]);

  // Socket.io room join
  useEffect(() => {
    const socket = getSocket();
    if (!id) return;
    socket.emit('join:project', { projectId: id });
    socket.on('project:message', (msg) => {
      setMessages((prev) => [msg, ...prev]);
    });
    return () => {
      socket.emit('leave:project', { projectId: id });
      socket.off('project:message');
    };
  }, [id]);

  const columns = useMemo(() => ({
    to_do: { id: 'to_do', title: 'To Do', color: 'bg-yellow-100 text-yellow-800' },
    in_progress: { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    done: { id: 'done', title: 'Completed', color: 'bg-green-100 text-green-800' },
  }), []);

  const tasksByStatus = useMemo(() => {
    return {
      to_do: tasks.filter((t) => t.status === 'to_do'),
      in_progress: tasks.filter((t) => t.status === 'in_progress'),
      done: tasks.filter((t) => t.status === 'done'),
    };
  }, [tasks]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    try {
      await updateTask(draggableId, { status: destination.droppableId });
      toast.success('Task updated');
    } catch (e) {
      toast.error('Failed to update task');
    }
  };

  const sendMessage = () => {
    const socket = getSocket();
    if (!messageText.trim()) return;
    const payload = { projectId: id, text: messageText };
    socket.emit('project:message', payload);
    setMessageText('');
  };

  if (projectLoading || !currentProject) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600 dark:text-gray-300">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading project...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{currentProject.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">Project workspace</p>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2"><Crown className="w-5 h-5 text-yellow-600" /><span>Admin</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar name={currentProject.owner?.name} src={currentProject.owner?.avatar} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{currentProject.owner?.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Project Lead</p>
                  </div>
                </div>
                <Button variant="outline" className="flex items-center"><Mail className="w-4 h-4 mr-2" />Message Lead</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2"><Users className="w-5 h-5" /><span>Team</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentProject.members?.map((m) => (
                  <div key={m._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar name={m.name} src={m.avatar} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{m.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Member</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="text-sm">Chat</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2"><MessageSquare className="w-5 h-5" /><span>Group Chat</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-3 border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-white dark:bg-gray-800">
                {messages.map((msg, idx) => (
                  <div key={idx} className="text-sm text-gray-800 dark:text-gray-200">
                    {msg.text || msg}
                  </div>
                ))}
              </div>
              <div className="flex items-center mt-3 space-x-2">
                <input
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Panel */}
        <div className="lg:col-span-1 lg:col-span-1 xl:col-span-1 lg:col-start-2 space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Kanban Board</CardTitle>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.values(columns).map((col) => (
                    <Droppable droppableId={col.id} key={col.id}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 min-h-[300px]">
                          <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${col.color} mb-3`}>{col.title}</div>
                          {(tasksByStatus[col.id] || []).map((task, index) => (
                            <Draggable draggableId={task._id} index={index} key={task._id}>
                              {(dragProvided) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  className="mb-3 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                                >
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</p>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  ))}
                </div>
              </DragDropContext>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tasks Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{tasksByStatus.done.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{tasksByStatus.in_progress.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">To Do</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{tasksByStatus.to_do.length}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Charts coming soon (Recharts/Chart.js)</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 dark:text-gray-400">Discussion threads coming soon. Post weekly updates, attach files, and reply in threads.</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


