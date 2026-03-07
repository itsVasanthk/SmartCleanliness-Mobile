import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, Title, Paragraph, Button, Chip, ActivityIndicator, useTheme } from 'react-native-paper';
import { Calendar, MapPin, Award } from 'lucide-react-native';
import { fetchVolunteerEvents, joinEvent } from '../api/api';

const VolunteerEvents = ({ route }) => {
  const { user } = route.params;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const loadEvents = async () => {
    try {
      const data = await fetchVolunteerEvents(user.user_id);
      setEvents(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleJoin = async (eventId) => {
    try {
      await joinEvent(user.user_id, eventId);
      Alert.alert('Success', 'You have joined the event!');
      loadEvents();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const renderEvent = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title style={styles.eventTitle}>{item.title}</Title>
          <Chip icon={() => <Award size={14} color="#fff" />} style={styles.pointsChip} textStyle={{ color: '#fff' }}>
            {item.points} pts
          </Chip>
        </View>
        
        <View style={styles.infoRow}>
          <Calendar size={16} color="#666" />
          <Text style={styles.infoText}>{item.date}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MapPin size={16} color="#666" />
          <Text style={styles.infoText}>{item.area}</Text>
        </View>
        
        <Paragraph style={styles.description}>{item.description}</Paragraph>
      </Card.Content>
      <Card.Actions>
        {item.is_joined ? (
          <Button mode="outlined" disabled style={styles.joinedButton}>Joined</Button>
        ) : (
          <Button 
            mode="contained" 
            onPress={() => handleJoin(item.id)}
            disabled={item.status === 'Completed'}
          >
            {item.status === 'Completed' ? 'Completed' : 'Join Event'}
          </Button>
        )}
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No upcoming events found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    flex: 1,
    marginRight: 8,
  },
  pointsChip: {
    backgroundColor: '#2E7D32',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  description: {
    marginTop: 12,
    color: '#444',
  },
  joinedButton: {
    borderColor: '#2E7D32',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
  }
});

export default VolunteerEvents;
