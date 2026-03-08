import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, Title, Paragraph, Button, FAB, TextInput, List, Divider, ActivityIndicator, useTheme, Portal, Avatar, IconButton, Modal } from 'react-native-paper';
import { Calendar as CalendarIcon, MapPin, Users, Plus, ChevronRight, Clock, Award } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchVolunteerEvents, createEvent, fetchEventParticipants } from '../api/api';

const { width } = Dimensions.get('window');

const ManageEventsScreen = ({ route }) => {
  const { user } = route.params;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [participantsModalVisible, setParticipantsModalVisible] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const [eventDate, setEventDate] = useState(new Date(new Date().getTime() + 86400000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [points, setPoints] = useState('100');
  const [submitting, setSubmitting] = useState(false);

  const theme = useTheme();

  const loadEvents = async () => {
    try {
      const data = await fetchVolunteerEvents(user.user_id);
      setEvents(data);
    } catch (err) {
      console.error(err);
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
      Alert.alert('Success', 'Event Created Successfully!');
      setModalVisible(false);
      resetForm();
      loadEvents();
    } catch (err) {
      Alert.alert('Error', 'Failed to create event');
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
    if (selectedDate) setEventDate(selectedDate);
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
          <View style={{ flex: 1 }}>
            <Title style={styles.eventTitle}>{item.title}</Title>
            <View style={styles.badgeRow}>
               <View style={styles.statusBadge}>
                 <Text style={styles.statusText}>{item.status}</Text>
               </View>
               <View style={styles.pointsBadge}>
                 <Award size={12} color="#FFA000" />
                 <Text style={styles.pointsText}>{item.points} pts</Text>
               </View>
            </View>
          </View>
          <ChevronRight size={20} color="#999" />
        </View>
        <Divider style={styles.cardDivider} />
        <View style={styles.infoRow}>
          <View style={styles.infoItem}><Clock size={14} color="#2E7D32" /><Text style={styles.infoText}>{item.date}</Text></View>
          <View style={styles.infoItem}><MapPin size={14} color="#2E7D32" /><Text style={styles.infoText}>{item.area}</Text></View>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#2E7D32" /></View>;
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
            <Text style={styles.headerTitle}>Cleaning Campaigns</Text>
            <Text style={styles.headerSubtitle}>Manage and track city-wide cleanup efforts</Text>
          </View>
        }
      />

      <Portal>
        {/* Create Event Modal */}
        <Modal 
          visible={modalVisible} 
          onDismiss={() => setModalVisible(false)} 
          contentContainerStyle={styles.modalContentStyle}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Host Cleanup Event</Text>
               <IconButton icon="close" onPress={() => setModalVisible(false)} size={24} />
            </View>

            <View style={styles.formContainer}>
               <TextInput label="Event Title" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
               <TextInput label="Description" value={description} onChangeText={setDescription} mode="outlined" multiline numberOfLines={3} style={styles.input} />
               <TextInput label="Area" value={area} onChangeText={setArea} mode="outlined" style={styles.input} left={<TextInput.Icon icon="map-marker" />} />

               <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
                 <View style={styles.dateIconContainer}><CalendarIcon size={20} color="#2E7D32" /></View>
                 <View><Text style={styles.dateLabel}>Event Date</Text><Text style={styles.dateValue}>{eventDate.toDateString()}</Text></View>
               </TouchableOpacity>

               {showDatePicker && <DateTimePicker value={eventDate} mode="date" display="default" minimumDate={new Date()} onChange={onDateChange} />}
               
               <TextInput label="Reward Points" value={points} onChangeText={setPoints} keyboardType="numeric" mode="outlined" style={styles.input} left={<TextInput.Icon icon="star" />} />
               
               <Button mode="contained" onPress={handleCreateEvent} loading={submitting} style={styles.createBtn} contentStyle={{ height: 50 }}>
                 Confirm and Schedule
               </Button>
            </View>
          </ScrollView>
        </Modal>

        {/* Participants Modal */}
        <Modal 
          visible={participantsModalVisible} 
          onDismiss={() => setParticipantsModalVisible(false)} 
          contentContainerStyle={styles.modalContentStyle}
        >
          <View style={styles.modalHeader}>
             <Text style={styles.modalTitle}>Volunteers</Text>
             <IconButton icon="close" onPress={() => setParticipantsModalVisible(false)} size={24} />
          </View>
          <Text style={styles.modalSubtitle}>{selectedEvent?.title}</Text>
          
          <View style={styles.detailBox}>
             <Text style={styles.volunteerDetailLine}>Details of who joined the event:</Text>
          </View>

          <Divider style={{ marginVertical: 15 }} />
          
          {loadingParticipants ? (
            <ActivityIndicator style={{ margin: 40 }} color="#2E7D32" />
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
                  left={props => <Avatar.Text size={42} style={{ backgroundColor: '#2E7D32' }} label={item.name[0].toUpperCase()} />}
                  right={() => <Text style={styles.joinedAt}>{item.joined_at.split(' ')[0]}</Text>}
                  style={styles.listItem}
                />
              )}
            />
          ) : (
            <View style={styles.emptyContainer}>
               <Users size={40} color="#ccc" />
               <Text style={styles.emptyText}>No volunteers yet.</Text>
            </View>
          )}
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        label="New Event"
        style={[styles.fab, { backgroundColor: '#2E7D32' }]}
        color="#fff"
        onPress={() => setModalVisible(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F3',
  },
  list: {
    padding: 20,
    paddingBottom: 100,
  },
  headerArea: {
    marginBottom: 24,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B5E20',
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 15,
  },
  eventCard: {
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 3,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#333',
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2E7D32',
    textTransform: 'uppercase',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  pointsText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFA000',
  },
  cardDivider: {
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#555',
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  modalContentStyle: {
    backgroundColor: 'white',
    margin: 20,
    padding: 24,
    borderRadius: 24,
    elevation: 10,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2E7D32',
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: -5,
  },
  detailBox: {
    backgroundColor: '#F1F8E9',
    padding: 12,
    borderRadius: 12,
    marginTop: 15,
  },
  volunteerDetailLine: {
    fontSize: 14,
    color: '#1B5E20',
    fontWeight: '700',
  },
  formContainer: {
    marginTop: 10,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0', 
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
    backgroundColor: '#FAFAFA',
  },
  dateIconContainer: {
    padding: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
  },
  dateLabel: {
    fontSize: 11,
    color: '#777',
    fontWeight: '700',
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  createBtn: {
    borderRadius: 14,
    marginTop: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 15,
    color: '#AAA',
    fontSize: 16,
  },
  joinedAt: {
    fontSize: 11,
    color: '#999',
    alignSelf: 'center',
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  listItemDesc: {
    fontSize: 13,
    color: '#777',
  }
});

export default ManageEventsScreen;
