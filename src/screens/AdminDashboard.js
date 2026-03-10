import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Title, Paragraph, Button, useTheme, ActivityIndicator, IconButton, Avatar, Divider, Portal, Modal, List } from 'react-native-paper';
import { LayoutDashboard, Truck, Users, User, LogOut, X, AlertTriangle, Calendar, Heart } from 'lucide-react-native';
import { fetchAdminStats, fetchEscalatedComplaints, fetchAvailableVehiclesAdmin, assignVehicleAdmin } from '../api/api';

const AdminDashboard = ({ navigation, route }) => {
  const { user } = route.params;
  const [stats, setStats] = useState(null);
  const [escalatedReports, setEscalatedReports] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visible, setVisible] = useState(false); // Vehicle assignment modal
  const [profileVisible, setProfileVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const theme = useTheme();

  const loadData = async () => {
    try {
      const [statsData, complaintsData] = await Promise.all([
        fetchAdminStats(),
        fetchEscalatedComplaints()
      ]);
      setStats(statsData);
      setEscalatedReports(complaintsData);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const showAssignModal = async (complaint) => {
    setSelectedComplaint(complaint);
    try {
      const availableVehicles = await fetchAvailableVehiclesAdmin();
      setVehicles(availableVehicles);
      setVisible(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch available vehicles');
    }
  };

  const hideModal = () => {
    setVisible(false);
    setSelectedComplaint(null);
  };

  const handleAssign = async (volunteerId) => {
    try {
      await assignVehicleAdmin(selectedComplaint.id, volunteerId);
      Alert.alert('Success', 'Vehicle and volunteer assigned successfully');
      hideModal();
      loadData();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleLogout = () => {
    setProfileVisible(false);
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => navigation.replace('Login')
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Title>Admin Dashboard</Title>
              <Text style={styles.subtitle}>Full System Control</Text>
            </View>
            <IconButton 
              icon={() => <User size={24} color={theme.colors.primary} />} 
              onPress={() => setProfileVisible(true)} 
              style={styles.profileBtn}
            />
          </View>
        </View>

        {/* Profile Modal */}
        <Portal>
          <Modal
            visible={profileVisible}
            onDismiss={() => setProfileVisible(false)}
            contentContainerStyle={styles.profileModal}
          >
            <View style={styles.modalHeader}>
              <Title>Admin Profile</Title>
              <IconButton icon={() => <X size={20} color="#666" />} onPress={() => setProfileVisible(false)} />
            </View>
            
            <View style={styles.profileInfo}>
              <Avatar.Text 
                size={80} 
                label={user.name[0].toUpperCase()} 
                style={styles.avatar} 
              />
              <Title style={styles.profileName}>{user.name}</Title>
              <Text style={styles.profileEmail}>{user.email}</Text>
              <View style={styles.roleChip}>
                <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <Button 
              mode="contained-tonal" 
              icon={() => <LogOut size={18} color="#D32F2F" />}
              onPress={handleLogout}
              style={styles.logoutBtn}
              labelStyle={{ color: '#D32F2F' }}
            >
              Sign Out
            </Button>
          </Modal>
        </Portal>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { borderLeftColor: '#f44336', borderLeftWidth: 4 }]}>
            <Card.Content>
              <View style={styles.statHeader}>
                <AlertTriangle size={20} color="#f44336" />
                <Text style={[styles.statVal, { color: '#f44336' }]}>{stats?.escalated_reports || 0}</Text>
              </View>
              <Text style={styles.statLab}>Escalated</Text>
            </Card.Content>
          </Card>
          
          <Card style={[styles.statCard, { borderLeftColor: '#2196F3', borderLeftWidth: 4 }]}>
            <Card.Content>
              <View style={styles.statHeader}>
                <Users size={20} color="#2196F3" />
                <Text style={styles.statVal}>{stats?.total_volunteers || 0}</Text>
              </View>
              <Text style={styles.statLab}>Volunteers</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { borderLeftColor: '#4CAF50', borderLeftWidth: 4 }]}>
            <Card.Content>
              <View style={styles.statHeader}>
                <Truck size={20} color="#4CAF50" />
                <Text style={[styles.statVal, { color: '#4CAF50' }]}>{stats?.total_vehicles || 0}</Text>
              </View>
              <Text style={styles.statLab}>Vehicles</Text>
            </Card.Content>
          </Card>
          
          <Card style={[styles.statCard, { borderLeftColor: '#E91E63', borderLeftWidth: 4 }]}>
            <Card.Content>
              <View style={styles.statHeader}>
                <Heart size={20} color="#E91E63" />
                <Text style={[styles.statVal, { color: '#E91E63' }]}>₹{stats?.fund_balance || 0}</Text>
              </View>
              <Text style={styles.statLab}>Total Funds</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Admin Actions */}
        <View style={styles.actionsContainer}>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('EmergencyManagement', { user })}
            icon={() => <Heart size={18} color="#fff" />}
            style={styles.actionBtn}
            buttonColor="#D32F2F"
          >
            Manage Funds
          </Button>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('ManageEvents', { user })}
            icon={() => <Calendar size={18} color="#fff" />}
            style={[styles.actionBtn, { backgroundColor: '#1976D2' }]}
          >
            Create Events
          </Button>
        </View>

        <View style={styles.sectionHeader}>
          <Title>Escalated Reports</Title>
          <Text style={styles.sectionSubtitle}>Reports requiring immediate admin action</Text>
        </View>

        {escalatedReports.length === 0 ? (
          <View style={styles.emptyState}>
            <Paragraph>No escalated reports found.</Paragraph>
          </View>
        ) : (
          escalatedReports.map((item) => (
            <Card key={item.id} style={styles.complaintCard}>
              <Card.Title 
                title={item.type} 
                subtitle={`${item.area} (ID: ${item.id})`}
                right={() => <View style={styles.escalatedBadge}><Text style={styles.escalatedText}>ESCALATED</Text></View>}
              />
              <Card.Content>
                <Paragraph>{item.description}</Paragraph>
                <Divider style={{ marginVertical: 8 }} />
                {item.authority_decision === 'disagreed' && (
                    <View style={styles.reasonBox}>
                        <Text style={styles.reasonTitle}>Authority Reason for Disagreement:</Text>
                        <Text style={styles.reasonText}>{item.authority_reason}</Text>
                    </View>
                )}
                <Text style={styles.timestamp}>Reported: {item.created_at}</Text>
              </Card.Content>
              <Card.Actions>
                <Button mode="contained" onPress={() => showAssignModal(item)}>
                  Resolve with Volunteer
                </Button>
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>

      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.assignModal}>
          <Title>Assign Volunteer & Vehicle</Title>
          <Paragraph style={styles.modalSubtitle}>Assign an available resource to resolve this report</Paragraph>
          <Divider style={styles.divider} />
          {vehicles.length > 0 ? (
            <ScrollView style={{ maxHeight: 300 }}>
              {vehicles.map((v) => (
                <List.Item
                  key={v.id}
                  title={v.volunteer_name}
                  description={`${v.type} - ${v.number} (${v.area})`}
                  left={props => <Truck {...props} />}
                  onPress={() => handleAssign(v.id)}
                />
              ))}
            </ScrollView>
          ) : (
            <Paragraph>No resources available at the moment.</Paragraph>
          )}
          <Button onPress={hideModal} style={{ marginTop: 16 }}>Cancel</Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 2,
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
  },
  profileBtn: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statVal: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLab: {
    fontSize: 12,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  complaintCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  escalatedBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10,
  },
  escalatedText: {
    color: '#D32F2F',
    fontSize: 10,
    fontWeight: 'bold',
  },
  reasonBox: {
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  reasonTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#E65100',
  },
  reasonText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 8,
  },
  assignModal: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 20,
    elevation: 5,
  },
  modalSubtitle: {
    color: '#666',
    marginBottom: 12,
  },
  divider: {
    marginBottom: 16,
  },
  profileModal: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    backgroundColor: '#1976D2',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileEmail: {
    color: '#666',
    marginBottom: 12,
  },
  roleChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  logoutBtn: {
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
  },
});

export default AdminDashboard;
