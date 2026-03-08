import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Title, Paragraph, Button, List, Divider, useTheme, ActivityIndicator } from 'react-native-paper';
import { Handshake, Truck, History, Star } from 'lucide-react-native';
import { fetchVolunteerStats, markTransportComplete } from '../api/api';

const VolunteerDashboard = ({ navigation, route }) => {
  const { user } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const loadData = async () => {
    try {
      const stats = await fetchVolunteerStats(user.user_id);
      setData(stats);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load volunteer data');
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

  const handleCompleteTransport = async (complaintId) => {
    try {
      await markTransportComplete(complaintId);
      Alert.alert('Success', 'Transport marked as completed!');
      loadData();
    } catch (err) {
      Alert.alert('Error', err.message);
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
      {/* Carbon Credits Card */}
      <Card style={styles.pointsCard}>
        <Card.Content style={styles.pointsContent}>
          <View>
            <Title style={styles.pointsTitle}>Carbon Credits</Title>
            <Text style={styles.pointsValue}>{data?.total_points || 0}</Text>
          </View>
          <Handshake size={50} color={theme.colors.primary} />
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('VolunteerEvents', { user })}>
            View Events
          </Button>
        </Card.Actions>
      </Card>

      {/* Vehicle Registration */}
      <Card style={styles.sectionCard}>
        <Card.Title 
          title="Vehicle Volunteering" 
          left={(props) => <Truck {...props} color={theme.colors.primary} />} 
        />
        <Card.Content>
          {data?.has_vehicle ? (
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleStatus}>Status: {data.vehicle_details.status}</Text>
              <Paragraph>Type: {data.vehicle_details.type}</Paragraph>
              <Paragraph>Number: {data.vehicle_details.number}</Paragraph>
              <Paragraph>Area: {data.vehicle_details.area}</Paragraph>
            </View>
          ) : (
            <Paragraph style={styles.infoText}>
              Register your vehicle to help transport waste and earn more credits.
            </Paragraph>
          )}
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('VehicleRegistration', { user })}>
            {data?.has_vehicle ? 'Update Vehicle' : 'Register Vehicle'}
          </Button>
        </Card.Actions>
      </Card>

      {/* Transport Assignments */}
      {data?.transport_assignments?.length > 0 && (
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Active Assignments</Title>
          {data.transport_assignments.map((item) => (
            <Card key={item.complaint_id} style={styles.assignmentCard}>
              <Card.Title 
                title={`Complaint #${item.complaint_id}`}
                subtitle={`${item.area} - ${item.landmark}`}
              />
              <Card.Actions>
                {item.status !== 'completed' && (
                  <Button mode="contained" onPress={() => handleCompleteTransport(item.complaint_id)}>
                    Mark Completed
                  </Button>
                )}
              </Card.Actions>
            </Card>
          ))}
        </View>
      )}

      {/* History */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Credit History</Title>
        <Card style={styles.historyCard}>
          {data?.credit_history?.length > 0 ? (
            data.credit_history.map((item, index) => (
              <React.Fragment key={index}>
                <List.Item
                  title={item.activity}
                  description={item.date}
                  left={props => <Star {...props} size={20} color="#FFD700" />}
                  right={() => <Text style={styles.historyPoints}>+{item.points}</Text>}
                />
                {index < data.credit_history.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <Card.Content>
              <Paragraph>No credits earned yet. Join an event!</Paragraph>
            </Card.Content>
          )}
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsCard: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
  },
  pointsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  pointsTitle: {
    fontSize: 18,
    color: '#666',
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  sectionCard: {
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    color: '#666',
  },
  vehicleInfo: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
  },
  vehicleStatus: {
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  section: {
    marginTop: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  assignmentCard: {
    marginBottom: 8,
    borderRadius: 8,
  },
  historyCard: {
    borderRadius: 12,
  },
  historyPoints: {
    fontWeight: 'bold',
    color: '#2E7D32',
    alignSelf: 'center',
  },
});

export default VolunteerDashboard;
