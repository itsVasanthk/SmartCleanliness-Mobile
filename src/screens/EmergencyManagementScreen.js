import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Image } from 'react-native';
import { Text, Card, Title, Paragraph, Button, List, Divider, useTheme, ActivityIndicator, Chip } from 'react-native-paper';
import { ShieldCheck, ShieldAlert, CheckCircle2, X, Heart, AlertCircle } from 'lucide-react-native';
import { fetchAllEmergencyRequests, approveEmergencyRequest } from '../api/api';

const EmergencyManagementScreen = () => {
  const [requests, setRequests] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const loadRequests = async () => {
    try {
      const data = await fetchAllEmergencyRequests();
      if (data.success) {
        setRequests(data.requests);
        setWalletBalance(data.wallet_balance || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRequests();
  }, []);

  const handleApprove = async (requestId) => {
    Alert.alert(
      "Approve Request",
      "This will deduct funds from the wallet and mark the request as paid. Proceed?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Approve & Pay", 
          onPress: async () => {
            try {
              const res = await approveEmergencyRequest(requestId);
              if (res.success) {
                Alert.alert("Success", "Emergency request approved and funds disbursed.");
                loadRequests();
              }
            } catch (err) {
              Alert.alert("Error", err.message);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'rejected': return '#F44336';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Title>Emergency Requests</Title>
        <Text style={styles.subtitle}>Review identity and approve assistance</Text>
      </View>

      <Card style={styles.balanceCard}>
        <Card.Content style={styles.balanceContent}>
           <View>
              <Text style={styles.balanceLabel}>Current Wallet Balance</Text>
              <Title style={styles.balanceValue}>₹ {walletBalance.toLocaleString()}</Title>
           </View>
           <Heart size={32} color="#E91E63" fill="#E91E63" />
        </Card.Content>
      </Card>

      {requests.length === 0 ? (
        <View style={styles.emptyState}>
          <ShieldCheck size={64} color="#ccc" />
          <Text style={styles.emptyText}>No emergency requests found.</Text>
        </View>
      ) : (
        requests.map((item) => {
          const isLowBalance = item.status === 'pending' && item.amount_requested > walletBalance;
          
          return (
            <Card key={item.request_id} style={[styles.card, isLowBalance && styles.lowBalanceCard]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View>
                    <Title>Req #{item.request_id}</Title>
                    <Text style={styles.date}>{item.created_at}</Text>
                  </View>
                  <Chip 
                    textStyle={{ color: '#fff' }} 
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  >
                    {item.status.toUpperCase()}
                  </Chip>
                </View>

                {isLowBalance && (
                  <View style={styles.warningBox}>
                    <AlertCircle size={16} color="#D32F2F" />
                    <Text style={styles.warningText}>Insufficient Balance to Pay</Text>
                  </View>
                )}

                <Divider style={styles.divider} />

                <Paragraph style={styles.reason}><Text style={styles.label}>Reason:</Text> {item.reason}</Paragraph>
                <Title style={styles.amount}>₹ {item.amount_requested}</Title>

                <View style={styles.aiVerification}>
                  <ShieldAlert size={16} color={item.ai_distance < 0.6 ? "#4CAF50" : "#F44336"} />
                  <Text style={[styles.aiText, { color: item.ai_distance < 0.6 ? "#4CAF50" : "#F44336" }]}>
                    AI Match Distance: {item.ai_distance.toFixed(4)} 
                    ({item.ai_distance < 0.6 ? 'VERIFIED MATCH' : 'IDENTITY MISMATCH'})
                  </Text>
                </View>
                <Text style={styles.aiNote}>*Score below 0.6 indicates same person.</Text>

                <Divider style={styles.divider} />

                {item.status === 'pending' && (
                  <View style={styles.actions}>
                    <Button 
                      mode="contained" 
                      icon={() => <CheckCircle2 size={18} color="#fff" />}
                      onPress={() => handleApprove(item.request_id)}
                      disabled={isLowBalance}
                      style={[styles.approveBtn, isLowBalance && { backgroundColor: '#ccc' }]}
                    >
                      {isLowBalance ? 'Add Funds to Pay' : 'Approve & Disburse'}
                    </Button>
                  </View>
                )}
              </Card.Content>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#fff', marginBottom: 10 },
  subtitle: { color: '#666', fontSize: 13 },
  card: { margin: 10, borderRadius: 12, elevation: 3 },
  lowBalanceCard: { borderColor: '#FFCDD2', borderWidth: 2 },
  balanceCard: { margin: 10, borderRadius: 12, backgroundColor: '#fff', elevation: 2 },
  balanceContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { fontSize: 12, color: '#666' },
  balanceValue: { color: '#E91E63', fontWeight: 'bold' },
  warningBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFEBEE', padding: 8, borderRadius: 6, marginTop: 10 },
  warningText: { color: '#D32F2F', fontSize: 12, marginLeft: 6, fontWeight: 'bold' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 11, color: '#999' },
  divider: { marginVertical: 10 },
  reason: { fontSize: 14, color: '#333' },
  label: { fontWeight: 'bold' },
  amount: { color: '#2E7D32', fontSize: 24, fontWeight: 'bold' },
  aiVerification: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  aiText: { fontSize: 12, marginLeft: 5, fontWeight: '600' },
  aiNote: { fontSize: 10, color: '#999', fontStyle: 'italic', marginTop: 2 },
  actions: { marginTop: 10 },
  approveBtn: { borderRadius: 8, backgroundColor: '#2E7D32' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 20, color: '#999', fontSize: 16 }
});

export default EmergencyManagementScreen;
