import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { AdminService } from '../../services/admin';
import { LoadingSpinner } from '../shared';
import NavigationBar from '../NavigationBar';
import { User } from '../../types';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [transactionStats, setTransactionStats] = useState<any>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.isAdmin) {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      try {
        const [allUsers, statistics, txStats] = await Promise.all([
          AdminService.getAllUsers(),
          AdminService.getUserStatistics(),
          AdminService.getTransactionStatistics()
        ]);

        setUsers(allUsers);
        setStats(statistics);
        setTransactionStats(txStats);
      } catch (err) {
        setError('Failed to load admin dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  const handleUnlockUser = async (userId: string) => {
    try {
      await AdminService.unlockUser(userId);
      setUsers(users.map(u => 
        u.id === userId ? { ...u, isLocked: false, loginAttempts: 0 } : u
      ));
    } catch (err) {
      setError('Failed to unlock user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await AdminService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <>
        <NavigationBar />
        <Container className="mt-4">
          <LoadingSpinner />
        </Container>
      </>
    );
  }

  if (!user?.isAdmin) {
    return (
      <>
        <NavigationBar />
        <Container className="mt-4">
          <Alert variant="danger">
            Access denied. Admin privileges required.
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <NavigationBar />
      <Container>
        <h2 className="mb-4">Admin Dashboard</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        <Row className="mb-4">
          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Total Users</Card.Title>
                <Card.Text className="h2">{stats?.totalUsers || 0}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Total Accounts</Card.Title>
                <Card.Text className="h2">{stats?.totalAccounts || 0}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Total Transactions</Card.Title>
                <Card.Text className="h2">{stats?.totalTransactions || 0}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Locked Users</Card.Title>
                <Card.Text className="h2">
                  {users.filter(u => u.isLocked).length}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>Total Balance by Currency</Card.Title>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Currency</th>
                      <th>Total Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.totalBalance && Object.entries(stats.totalBalance).map(([currency, balance]) => (
                      <tr key={currency}>
                        <td>{currency}</td>
                        <td>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: currency
                          }).format(balance as number)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>Transactions by Type</Card.Title>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionStats?.transactionsByType && 
                      Object.entries(transactionStats.transactionsByType).map(([type, count]) => (
                        <tr key={type}>
                          <td>{type}</td>
                          <td>{count}</td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card>
          <Card.Body>
            <Card.Title>User Management</Card.Title>
            <Table responsive>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Admin</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.isAdmin ? '✅' : '❌'}</td>
                    <td>
                      {user.isLocked ? (
                        <span className="text-danger">Locked</span>
                      ) : (
                        <span className="text-success">Active</span>
                      )}
                    </td>
                    <td>
                      {user.isLocked && (
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleUnlockUser(user.id)}
                        >
                          Unlock
                        </Button>
                      )}
                      {!user.isAdmin && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default AdminDashboard;