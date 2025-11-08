import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';

let socket;

// Returns a singleton socket. On connect it will automatically join the
// user's personal room (user-<id>) if the user is authenticated and will
// forward incoming `notification` events into the notification store so
// notifications are available app-wide.
export const getSocket = () => {
  if (!socket) {
    const url = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
    socket = io(url, {
      withCredentials: true,
      transports: ['websocket'],
    });

    // When socket connects (or reconnects), join the user's personal room
    socket.on('connect', () => {
      try {
        const user = useAuthStore.getState().user;
        if (user && user._id) {
          socket.emit('join:user', { userId: user._id });
        }
      } catch (e) {
        // ignore
      }
    });

    // Listen for server-side notifications and add to store
    socket.on('notification', (notification) => {
      try {
        const add = useNotificationStore.getState().addNotification;
        if (add) add(notification);
      } catch (e) {
        // ignore
      }
    });

    // Optional: re-emit join:user on reconnect to ensure room membership
    socket.io.on('reconnect', () => {
      try {
        const user = useAuthStore.getState().user;
        if (user && user._id) socket.emit('join:user', { userId: user._id });
      } catch (e) {}
    });
  }

  return socket;
};

export default getSocket;


