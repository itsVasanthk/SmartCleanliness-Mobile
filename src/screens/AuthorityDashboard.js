import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, FlatList } from 'react-native';
import { Text, Card, Title, Paragraph, Button, List, Divider, useTheme, ActivityIndicator, Modal, Portal, IconButton, Avatar } from 'react-native-paper';
import { LayoutDashboard, ClipboardCheck, Truck, Users, User, LogOut, X, Heart, Search } from 'lucide-react-native';
import { fetchAuthorityStats, fetchAllComplaints, fetchAvailableVehicles, assignVehicle } from '../api/api';

const AuthorityDashboard = ({ navigation, route }) => {
  const { user } = route.params;
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
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
        fetchAuthorityStats(),
        fetchAllComplaints()
      ]);
      setStats(statsData);
      setComplaints(complaintsData);
    } catch (err) {
      console.error(err);
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

  const showModal = async (complaint) => {
    setSelectedComplaint(complaint);
    try {
      const availableVehicles = await fetchAvailableVehicles();
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
      await assignVehicle(selectedComplaint.id, volunteerId);
      Alert.alert('Success', 'Vehicle assigned successfully');
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
              <Title>Authority Panel</Title>
              <Text style={styles.subtitle}>System-wide overview</Text>
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
              <Title>Authority Profile</Title>
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
          <Card style={[styles.statCard, { borderLeftColor: '#2196F3', borderLeftWidth: 4 }]}>
            <Card.Content>
              <View style={styles.statHeader}>
                <ClipboardCheck size={20} color="#2196F3" />
                <Text style={styles.statVal}>{stats?.total_complaints || 0}</Text>
              </View>
              <Text style={styles.statLab}>Total Reports</Text>
            </Card.Content>
          </Card>
          
          <Card style={[styles.statCard, { borderLeftColor: '#f44336', borderLeftWidth: 4 }]}>
            <Card.Content>
              <View style={styles.statHeader}>
                <LayoutDashboard size={20} color="#f44336" />
                <Text style={[styles.statVal, { color: '#f44336' }]}>{stats?.pending_complaints || 0}</Text>
              </View>
              <Text style={styles.statLab}>Pending</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { borderLeftColor: '#4CAF50', borderLeftWidth: 4 }]}>
            <Card.Content>
              <View style={styles.statHeader}>
                <Truck size={20} color="#4CAF50" />
                <Text style={[styles.statVal, { color: '#4CAF50' }]}>{stats?.resolved_complaints || 0}</Text>
              </View>
              <Text style={styles.statLab}>Resolved</Text>
            </Card.Content>
          </Card>
          
          <Card style={[styles.statCard, { borderLeftColor: '#E91E63', borderLeftWidth: 4 }]}>
            <Card.Content>
              <View style={styles.statHeader}>
                <Heart size={20} color="#E91E63" />
                <Text style={[styles.statVal, { color: '#E91E63' }]}>₹{stats?.fund_balance || 0}</Text>
              </View>
              <Text style={styles.statLab}>City Funds</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsGrid}>
           <Card style={[styles.statCard, { borderLeftColor: '#FF9800', borderLeftWidth: 4 }]}>
            <Card.Content>
              <View style={styles.statHeader}>
                <Users size={20} color="#FF9800" />
                <Text style={[styles.statVal, { color: '#FF9800' }]}>{stats?.total_volunteers || 0}</Text>
              </View>
              <Text style={styles.statLab}>Volunteers</Text>
            </Card.Content>
          </Card>
          
          <Card style={[styles.statCard, { borderLeftColor: '#9C27B0', borderLeftWidth: 4 }]}>
            <Card.Content>
              <View style={styles.statHeader}>
                <Search size={20} color="#9C27B0" />
                <Text style={[styles.statVal, { color: '#9C27B0' }]}>{stats?.total_events || 0}</Text>
              </View>
              <Text style={styles.statLab}>Events Held</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.titleRow}>
            <Title>Recent Complaints</Title>
            <View style={styles.headerButtons}>
              <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('ManageEvents', { user })}
                compact
                style={styles.manageBtn}
                labelStyle={{ fontSize: 10 }}
              >
                Events
              </Button>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('EmergencyManagement', { user })}
                compact
                style={[styles.manageBtn, { marginLeft: 4 }]}
                buttonColor="#D32F2F"
                textColor="#fff"
                labelStyle={{ fontSize: 10 }}
              >
                Help Funds
              </Button>
            </View>
          </View>
        </View>

        {complaints.map((item) => (
          <Card key={item.id} style={styles.complaintCard}>
            <Card.Title 
              title={item.type} 
              subtitle={item.area} 
              right={() => <Text style={styles.statusLabel}>{item.status}</Text>}
            />
            <Card.Content>
              <Paragraph>{item.description}</Paragraph>
              <Text style={styles.timestamp}>{item.created_at}</Text>
            </Card.Content>
            <Card.Actions>
              {item.status === 'Pending' && (
                <Button mode="contained" onPress={() => showModal(item)}>
                  Assign Vehicle
                </Button>
              )}
            </Card.Actions>
          </Card>
        ))}
      </ScrollView>

      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.assignModal}>
          <Title>Assign Vehicle</Title>
          <Paragraph style={styles.modalSubtitle}>Select an available volunteer's vehicle</Paragraph>
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
            <Paragraph>No vehicles available at the moment.</Paragraph>
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
    backgroundColor: '#1B5E20',
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
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  divider: {
    marginBottom: 20,
  },
  logoutBtn: {
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  manageBtn: {
    borderRadius: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  complaintCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 12,
    borderRadius: 12,
  },
  statusLabel: {
    marginRight: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 8,
  },
  assignModal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalSubtitle: {
    color: '#666',
    marginBottom: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default AuthorityDashboard;
