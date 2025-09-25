import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { Notification } from '../../types';

interface NotificationToastProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss
}) => {
  return (
    <ToastContainer className="notification p-3">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          onClose={() => onDismiss(notification.id)}
          show={!notification.read}
          bg={notification.type.toLowerCase()}
          delay={5000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Cristian Bank</strong>
            <small>{new Date(notification.date).toLocaleTimeString()}</small>
          </Toast.Header>
          <Toast.Body className={notification.type === 'ERROR' ? 'text-white' : ''}>
            {notification.message}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default NotificationToast;