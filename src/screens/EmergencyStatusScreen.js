import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph, Text, Button, Chip, useTheme, Divider } from 'react-native-paper';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react-native';
import { fetchEmergencyStatus } from '../api/api';

const EmergencyStatusScreen = ({ route }) => {
  const { user } = route.params;
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await fetchEmergencyStatus(user.user_id);
      if (data.success) {
        setRequest(data.request);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'rejected': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle2 size={24} color="#4CAF50" />;
      case 'pending': return <Clock size={24} color="#FF9800" />;
      case 'rejected': return <XCircle size={24} color="#F44336" />;
      default: return <AlertCircle size={24} color="#757575" />;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Title style={styles.headerTitle}>Assistance Tracking</Title>
      
      {!request ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.centered}>
            <AlertCircle size={48} color="#ccc" />
            <Paragraph style={styles.emptyText}>No active emergency requests found.</Paragraph>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.statusCard}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <View>
                <Title>Request #{request.request_id}</Title>
                <Text style={styles.date}>{request.created_at}</Text>
              </View>
              <Chip 
                textStyle={{ color: '#fff', fontWeight: 'bold' }} 
                style={{ backgroundColor: getStatusColor(request.status) }}
              >
                {request.status.toUpperCase()}
              </Chip>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>Reason:</Text>
              <Text style={styles.value}>{request.reason}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Amount Requested:</Text>
              <Text style={styles.amount}>₹{request.amount}</Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.TimelineItem}>
              {getStatusIcon(request.status)}
              <View style={styles.TimelineText}>
                <Text style={styles.timelineTitle}>
                  {request.status === 'pending' ? 'Identity Verified. Awaiting Authority Approval.' : 
                   request.status === 'paid' ? 'Assistance Approved and Disbursed.' : 
                   'Request Declined.'}
                </Text>
                {request.approved_at && (
                  <Text style={styles.timelineSub}>Approved on: {request.approved_at}</Text>
                )}
              </View>
            </View>
          </Card.Content>
          <Card.Actions>
            <Button onPress={loadStatus}>Refresh Status</Button>
          </Card.Actions>
        </Card>
      )}

      <View style={styles.helpBox}>
        <Paragraph style={styles.helpText}>
          Emergency funds are disbursed to your registered bank account once approved by the Madurai Cleanliness Authority.
        </Paragraph>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  content: { padding: 16 },
  headerTitle: { marginBottom: 20, fontSize: 22, fontWeight: 'bold' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  statusCard: { borderRadius: 12, elevation: 4 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  date: { fontSize: 12, color: '#666' },
  divider: { marginVertical: 15 },
  infoRow: { marginBottom: 10 },
  label: { fontSize: 13, color: '#666', marginBottom: 2 },
  value: { fontSize: 16, color: '#333' },
  amount: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32' },
  TimelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 5 },
  TimelineText: { marginLeft: 15, flex: 1 },
  timelineTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  timelineSub: { fontSize: 12, color: '#666', marginTop: 2 },
  emptyCard: { borderRadius: 12, paddingVertical: 40 },
  emptyText: { marginTop: 15, color: '#999' },
  helpBox: { marginTop: 30, paddingHorizontal: 10 },
  helpText: { fontSize: 12, color: '#777', textAlign: 'center', lineHeight: 18 },
});

export default EmergencyStatusScreen;
