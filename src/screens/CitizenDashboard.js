import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image, Alert } from 'react-native';
import { Card, Title, Paragraph, Text, Button, IconButton, useTheme, Portal, Modal, Avatar, Divider } from 'react-native-paper';
import { Camera, ClipboardList, MapPin, Award, User, LogOut, X } from 'lucide-react-native';
import { fetchDashboardStats } from '../api/api';

const CitizenDashboard = ({ navigation, route }) => {
  const { user } = route.params;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const theme = useTheme();

  const loadStats = async () => {
    try {
      const data = await fetchDashboardStats(user.user_id);
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStats();
  }, []);

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

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Title style={styles.welcomeText}>Hello, {user.name}!</Title>
              <Paragraph style={styles.locationText}>
                <MapPin size={14} color="#666" /> Madurai City
              </Paragraph>
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
              <Title>My Profile</Title>
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

        {/* Emotion AI Card */}
        <Card style={styles.emotionCard}>
          <Card.Content style={styles.emotionContent}>
            <View style={styles.emotionTextContainer}>
              <Title style={styles.statusTitle}>Madurai Status</Title>
              <Paragraph style={styles.sloganText}>
                {stats?.slogan || "Let's keep our city clean!"}
              </Paragraph>
            </View>
            <View style={styles.emotionImageContainer}>
               <Award size={60} color={stats?.emotion === 'happy' ? '#4CAF50' : '#FF9800'} />
            </View>
          </Card.Content>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statBox}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statValue}>{stats?.total_reports || 0}</Text>
              <Text style={styles.statLabel}>Total Reports</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statBox, { backgroundColor: '#E8F5E9' }]}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statValue, { color: '#2E7D32' }]}>{stats?.resolved_reports || 0}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statBox, { backgroundColor: '#FFF3E0' }]}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statValue, { color: '#EF6C00' }]}>{stats?.pending_reports || 0}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button 
            mode="contained" 
            icon={() => <Camera size={20} color="#fff" />}
            style={styles.mainActionButton}
            contentStyle={styles.actionButtonContent}
            onPress={() => navigation.navigate('Report', { user })}
          >
            Report Garbage Instantly
          </Button>

          <View style={styles.secondaryActions}>
            <Card style={styles.secondaryCard} onPress={() => navigation.navigate('MyReports', { user })}>
              <Card.Content style={styles.secondaryCardContent}>
                <ClipboardList size={24} color={theme.colors.primary} />
                <Text style={styles.secondaryCardText}>My Reports</Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.secondaryCard} onPress={() => navigation.navigate('Leaderboard', { user })}>
              <Card.Content style={styles.secondaryCardContent}>
                <Award size={24} color={theme.colors.primary} />
                <Text style={styles.secondaryCardText}>Leaderboard</Text>
              </Card.Content>
            </Card>
          </View>

          <View style={[styles.secondaryActions, { marginTop: 16, marginBottom: 32 }]}>
            <Card style={[styles.secondaryCard, { backgroundColor: '#E3F2FD' }]} onPress={() => navigation.navigate('VolunteerDashboard', { user })}>
              <Card.Content style={styles.secondaryCardContent}>
                <IconButton icon="handshake" size={30} iconColor="#1976D2" />
                <Text style={styles.secondaryCardText}>Volunteer Hub</Text>
              </Card.Content>
            </Card>
            
            <Card style={[styles.secondaryCard, { backgroundColor: '#F3E5F5' }]} onPress={() => navigation.navigate('Awareness', { user })}>
              <Card.Content style={styles.secondaryCardContent}>
                <IconButton icon="lightbulb-on" size={30} iconColor="#7B1FA2" />
                <Text style={styles.secondaryCardText}>Awareness Center</Text>
              </Card.Content>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
    backgroundColor: '#2E7D32',
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
    color: '#2E7D32',
  },
  divider: {
    marginBottom: 20,
  },
  logoutBtn: {
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
  },
  emotionCard: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  emotionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  emotionTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sloganText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  emotionImageContainer: {
    paddingLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    elevation: 1,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  actions: {
    paddingHorizontal: 16,
  },
  mainActionButton: {
    borderRadius: 12,
    marginBottom: 16,
  },
  actionButtonContent: {
    height: 56,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 16,
  },
  secondaryCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  secondaryCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  secondaryCardText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
});

export default CitizenDashboard;
