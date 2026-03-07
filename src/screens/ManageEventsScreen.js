import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Title, Paragraph, Button, FAB, TextInput, List, Divider, ActivityIndicator, useTheme, Portal, Avatar, IconButton } from 'react-native-paper';
import { Calendar as CalendarIcon, MapPin, Users, Plus, ChevronRight, Clock, Award } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchVolunteerEvents, createEvent, fetchEventParticipants } from '../api/api';

const ManageEventsScreen = ({ route }) => {
  const { user } = route.params;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [participantsModalVisible, setParticipantsModalVisible] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // New event form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const [eventDate, setEventDate] = useState(new Date(new Date().getTime() + 86400000)); // Default tomorrow
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [points, setPoints] = useState('100');
  const [submitting, setSubmitting] = useState(false);

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

  const handleCreateEvent = async () => {
    if (!title || !description || !area) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const formattedDate = eventDate.toISOString().split('T')[0];
      await createEvent({
        title,
        description,
        area,
        date: formattedDate,
        points: parseInt(points),
        created_by: user.user_id
      });
      Alert.alert('Success', 'Cleanup event created correctly!');
      setModalVisible(false);
      resetForm();
      loadEvents();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setArea('');
    setEventDate(new Date(new Date().getTime() + 86400000));
    setPoints('100');
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };

  const showParticipants = async (event) => {
    setSelectedEvent(event);
    setParticipantsModalVisible(true);
    setLoadingParticipants(true);
    try {
      const data = await fetchEventParticipants(event.id);
      setParticipants(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load participants');
    } finally {
      setLoadingParticipants(false);
    }
  };

  const renderEvent = ({ item }) => (
    <Card style={styles.eventCard} onPress={() => showParticipants(item)}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.titleInfo}>
            <Title style={styles.eventTitle}>{item.title}</Title>
            <View style={styles.badgeRow}>
               <View style={styles.statusBadge}>
                 <Text style={styles.statusText}>{item.status}</Text>
               </View>
               <View style={styles.pointsBadge}>
                 <Award size={12} color="#F57C00" />
                 <Text style={styles.pointsText}>{item.points} pts</Text>
               </View>
            </View>
          </View>
          <ChevronRight size={20} color="#666" />
        </View>
        
        <Divider style={styles.cardDivider} />
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Clock size={14} color={theme.colors.primary} />
            <Text style={styles.infoText}>{item.date}</Text>
          </View>
          <View style={styles.infoItem}>
            <MapPin size={14} color={theme.colors.primary} />
            <Text style={styles.infoText}>{item.area}</Text>
          </View>
        </View>
      </Card.Content>
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
        ListHeaderComponent={
          <View style={styles.headerArea}>
            <Title style={styles.headerTitle}>Cleaning Campaigns</Title>
            <Paragraph style={styles.headerSubtitle}>Manage and track city-wide cleanup efforts</Paragraph>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Avatar.Icon size={80} icon="calendar-blank" style={{ backgroundColor: '#f0f0f0' }} color="#ccc" />
            <Text style={styles.emptyText}>No cleanup events scheduled yet.</Text>
            <Button mode="outlined" onPress={() => setModalVisible(true)} style={{ marginTop: 16 }}>Create First Event</Button>
          </View>
        }
      />

      <Portal>
        {/* Create Event Modal */}
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
            <View style={styles.modalHeader}>
               <Title style={styles.modalTitle}>Host Cleanup Event</Title>
               <IconButton icon="close" onPress={() => setModalVisible(false)} size={20} />
            </View>

            <TextInput 
              label="Event Title" 
              value={title} 
              onChangeText={setTitle} 
              mode="outlined" 
              style={styles.input} 
              placeholder="e.g. Marina Beach Cleanup"
            />
            
            <TextInput 
              label="Description" 
              value={description} 
              onChangeText={setDescription} 
              mode="outlined" 
              multiline 
              numberOfLines={3} 
              style={styles.input} 
              placeholder="What needs to be done?"
            />
            
            <TextInput 
              label="Coverage Area" 
              value={area} 
              onChangeText={setArea} 
              mode="outlined" 
              style={styles.input} 
              left={<TextInput.Icon icon="map-marker" />}
              placeholder="e.g. Zone 10, Adyar"
            />

            <TouchableOpacity 
              style={styles.datePickerButton} 
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.dateIconContainer}>
                <CalendarIcon size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={styles.dateLabel}>Event Date</Text>
                <Text style={styles.dateValue}>{eventDate.toDateString()}</Text>
              </View>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={eventDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={onDateChange}
              />
            )}
            
            <TextInput 
              label="Volunteer Reward Points" 
              value={points} 
              onChangeText={setPoints} 
              keyboardType="numeric" 
              mode="outlined" 
              style={styles.input} 
              left={<TextInput.Icon icon="star" />}
            />
            
            <Button 
              mode="contained" 
              onPress={handleCreateEvent} 
              loading={submitting} 
              style={styles.createBtn}
              contentStyle={{ height: 48 }}
            >
              Confirm and Schedule
            </Button>
          </ScrollView>
        </Modal>

        {/* Participants Modal */}
        <Modal visible={participantsModalVisible} onDismiss={() => setParticipantsModalVisible(false)} contentContainerStyle={styles.participantsModal}>
          <View style={styles.modalHeader}>
             <Title style={styles.modalTitle}>Volunteers</Title>
             <IconButton icon="close" onPress={() => setParticipantsModalVisible(false)} size={20} />
          </View>
          <Paragraph style={styles.eventSubtitle}>{selectedEvent?.title}</Paragraph>
          <Text style={styles.volunteerDetailLine}>Details of who joined the event:</Text>
          <Divider style={{ marginVertical: 12 }} />
          
          {loadingParticipants ? (
            <ActivityIndicator style={{ margin: 40 }} />
          ) : participants.length > 0 ? (
            <FlatList
              data={participants}
              keyExtractor={(item, index) => index.toString()}
              style={{ maxHeight: 350 }}
              renderItem={({ item }) => (
                <List.Item
                  title={item.name}
                  description={item.email}
                  titleStyle={styles.listItemTitle}
                  descriptionStyle={styles.listItemDesc}
                  left={props => <Avatar.Text size={40} style={{ backgroundColor: theme.colors.primary }} label={item.name[0]} />}
                  right={() => (
                    <View style={{ justifyContent: 'center' }}>
                      <Text style={styles.joinedAt}>{item.joined_at.split(' ')[0]}</Text>
                    </View>
                  )}
                  style={styles.listItem}
                />
              )}
            />
          ) : (
            <View style={styles.emptyContainer}>
               <Users size={40} color="#ccc" />
               <Text style={styles.emptyText}>Waiting for volunteers to join.</Text>
            </View>
          )}
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        label="New Event"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#fff"
        onPress={() => setModalVisible(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  list: {
    padding: 20,
    paddingBottom: 100,
  },
  headerArea: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    color: '#666',
  },
  eventCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 8,
  },
  statusBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1976D2',
    textTransform: 'uppercase',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  pointsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F57C00',
  },
  cardDivider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#444',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 15,
    borderRadius: 24,
    elevation: 10,
    flexShrink: 1,
  },
  modalScroll: {
    maxHeight: '90%',
  },
  participantsModal: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 15,
    borderRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  eventSubtitle: {
    color: '#666',
    marginTop: -4,
    marginBottom: 8,
  },
  volunteerDetailLine: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
    marginTop: 4,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#79747E', // MD3 Outline color
    borderRadius: 4,
    marginBottom: 16,
    gap: 12,
  },
  dateIconContainer: {
    padding: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  createBtn: {
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    color: '#999',
    fontSize: 16,
  },
  joinedAt: {
    fontSize: 11,
    color: '#888',
  },
  listItem: {
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listItemDesc: {
    fontSize: 13,
  }
});


export default ManageEventsScreen;
