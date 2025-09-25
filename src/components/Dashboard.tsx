import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import NavigationBar from './NavigationBar';
import { AccountService, NotificationService } from '../services/api';
import { Account, Notification } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const [userAccounts, userNotifications] = await Promise.all([
          AccountService.getAccounts(user.id),
          NotificationService.getNotifications(user.id)
        ]);
        setAccounts(userAccounts);
        setNotifications(userNotifications);
      }
    };

    fetchData();
  }, [user]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <>
      <NavigationBar />
      <Container>
        <h2 className="mb-4">Welcome back, {user?.firstName}!</h2>
        
        <Row>
          <Col md={8}>
            <h3 className="mb-3">Your Accounts</h3>
            <Row>
              {accounts.map((account) => (
                <Col md={6} key={account.id} className="mb-3">
                  <Card className="h-100 account-card">
                    <Card.Body>
                      <Card.Title>{account.type} Account</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        {account.currency}
                      </Card.Subtitle>
                      <Card.Text className="h3">
                        {formatCurrency(account.balance, account.currency)}
                      </Card.Text>
                      <Card.Text>
                        Account ID: {account.id.slice(-4)}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
          
          <Col md={4}>
            <h3 className="mb-3">Recent Notifications</h3>
            <Card>
              <Card.Body>
                <div className="notification-list">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`alert alert-${notification.type.toLowerCase()} mb-2`}
                      >
                        {notification.message}
                        <small className="d-block text-muted">
                          {new Date(notification.date).toLocaleString()}
                        </small>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No new notifications</p>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Dashboard;