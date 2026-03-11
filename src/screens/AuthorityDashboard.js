import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TextInput, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Title, Paragraph, Button, Divider, useTheme, ActivityIndicator, Modal, Portal, IconButton, Avatar } from 'react-native-paper';
import { ClipboardCheck, LayoutDashboard, User, LogOut, X, CheckCircle, XCircle, History, MapPin, Clock } from 'lucide-react-native';
import { fetchAuthorityStats, fetchAllComplaints, authorityDecide, UPLOAD_URL } from '../api/api';

const AuthorityDashboard = ({ navigation, route }) => {
  const { user } = route.params;
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [decisionVisible, setDecisionVisible] = useState(false);
  const [disagreeReason, setDisagreeReason] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [profileVisible, setProfileVisible] = useState(false);
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

  const handleDecision = async (decision, complaintId = null) => {
    if (decision === 'disagreed' && !disagreeReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for disagreement');
      return;
    }

    const id = complaintId || selectedComplaint?.id;
    if (!id) {
      Alert.alert('Error', 'No complaint selected');
      return;
    }

    try {
      await authorityDecide(id, decision, disagreeReason);
      Alert.alert('Success', `Report ${decision} successfully`);
      setDecisionVisible(false);
      setDisagreeReason('');
      loadData();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const openDecisionModal = (complaint) => {
    setSelectedComplaint(complaint);
    setDecisionVisible(true);
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
              <Title>Government Panel</Title>
              <Text style={styles.subtitle}>Report Review & Verification</Text>
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
                <Text style={styles.roleText}>GOVERNMENT AUTHORITY</Text>
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

        {/* History Navigation Button */}
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => navigation.navigate('ReviewedReports', { user })}
        >
          <View style={styles.historyBtnContent}>
            <View style={styles.historyIconBox}>
              <History size={24} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.historyTitle}>Cleanup History</Text>
              <Text style={styles.historySub}>View past decisions and track progress</Text>
            </View>
            <IconButton icon="chevron-right" iconColor="#666" />
          </View>
        </TouchableOpacity>

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

          <Card style={[styles.statCard, { borderLeftColor: '#FF9800', borderLeftWidth: 4 }]}>
            <Card.Content>
              <View style={styles.statHeader}>
                <LayoutDashboard size={20} color="#FF9800" />
                <Text style={[styles.statVal, { color: '#FF9800' }]}>{stats?.pending_decisions || 0}</Text>
              </View>
              <Text style={styles.statLab}>Pending Review</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { borderLeftColor: '#4CAF50', borderLeftWidth: 4 }]}>
            <Card.Content>
              <View style={styles.statHeader}>
                <CheckCircle size={20} color="#4CAF50" />
                <Text style={[styles.statVal, { color: '#4CAF50' }]}>{stats?.agreed_complaints || 0}</Text>
              </View>
              <Text style={styles.statLab}>Agreed</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { borderLeftColor: '#f44336', borderLeftWidth: 4 }]}>
            <Card.Content>
              <View style={styles.statHeader}>
                <XCircle size={20} color="#f44336" />
                <Text style={[styles.statVal, { color: '#f44336' }]}>{stats?.disagreed_complaints || 0}</Text>
              </View>
              <Text style={styles.statLab}>Disagreed</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Reports to Review</Title>
          <View style={styles.titleUnderline} />
        </View>

        {complaints.filter(c => c.authority_decision === 'pending').map((item) => (
          <Card key={item.id} style={styles.premiumCard}>
            <View style={styles.cardHeader}>
              <View style={styles.imageBox}>
                {item.image ? (
                  <Image source={{ uri: `${UPLOAD_URL}/${item.image}` }} style={styles.cardImage} />
                ) : (
                  <View style={styles.imagePlaceholder}><Text style={{ fontSize: 10, color: '#999' }}>No Image</Text></View>
                )}
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.typeRow}>
                  <Text style={styles.cardType}>{item.type}</Text>
                  <View style={styles.pendingBadge}>
                    <Clock size={10} color="#FF9800" />
                    <Text style={styles.pendingText}>PENDING</Text>
                  </View>
                </View>

                <View style={styles.locationRow}>
                  <MapPin size={12} color="#666" />
                  <Text style={styles.locationText} numberOfLines={1}>{item.area}</Text>
                </View>

                <Paragraph style={styles.cardDesc} numberOfLines={2}>{item.description}</Paragraph>

                <View style={styles.footer}>
                  <Clock size={12} color="#999" />
                  <Text style={styles.timestamp}>{item.created_at.split(' ')[0]}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardActionsContainer}>
              <Button
                mode="contained"
                buttonColor="#4CAF50"
                onPress={() => {
                  setSelectedComplaint(item);
                  handleDecision('agreed', item.id);
                }}
                style={styles.actionBtn}
                contentStyle={{ height: 45 }}
                labelStyle={{ fontWeight: 'bold' }}
              >
                Agree
              </Button>
              <Button
                mode="contained"
                buttonColor="#f44336"
                onPress={() => openDecisionModal(item)}
                style={styles.actionBtn}
                contentStyle={{ height: 45 }}
                labelStyle={{ fontWeight: 'bold' }}
              >
                Disagree
              </Button>
            </View>
          </Card>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Decision Modal (for disagreement) */}
      <Portal>
        <Modal
          visible={decisionVisible}
          onDismiss={() => setDecisionVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title>Reason for Disagreement</Title>
          <Paragraph>Please explain why this report is being rejected.</Paragraph>
          <TextInput
            style={styles.textInput}
            placeholder="Type your reason here..."
            multiline
            numberOfLines={4}
            value={disagreeReason}
            onChangeText={setDisagreeReason}
          />
          <View style={styles.modalActions}>
            <Button onPress={() => setDecisionVisible(false)}>Cancel</Button>
            <Button mode="contained" buttonColor="#f44336" onPress={() => handleDecision('disagreed')}>
              Submit Disagreement
            </Button>
          </View>
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
    backgroundColor: '#1E3A8A',
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
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1E3A8A',
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
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  titleUnderline: {
    width: 40,
    height: 4,
    backgroundColor: '#2E7D32',
    borderRadius: 2,
    marginTop: 4,
  },
  historyBtn: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  historyBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  historyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  historySub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  premiumCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  imageBox: {
    width: 90,
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pendingText: {
    color: '#FF9800',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#444',
    marginTop: 8,
    lineHeight: 20,
  },
  cardActionsContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginLeft: 4,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 12,
    marginVertical: 16,
    textAlignVertical: 'top',
    backgroundColor: '#F9F9F9',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  }
});

export default AuthorityDashboard;
