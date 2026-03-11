import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Image, Alert } from 'react-native';
import { Card, Text, Title, Paragraph, Chip, useTheme, ActivityIndicator, Button, Portal, Modal, IconButton, TextInput } from 'react-native-paper';
import { fetchMyReports, UPLOAD_URL, submitFeedback } from '../api/api';
import { Edit2, MessageSquare, AlertTriangle, CheckCircle2, MapPin, Clock } from 'lucide-react-native';

const MyReportsScreen = ({ navigation, route }) => {
  const { user } = route.params;
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(5);
  const theme = useTheme();

  const loadReports = async () => {
    try {
      const data = await fetchMyReports(user.user_id);
      if (data.success) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReports();
  }, []);

  const handleFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert('Error', 'Please provide feedback text');
      return;
    }
    try {
      await submitFeedback({
        complaint_id: selectedReport.complaint_id,
        feedback: feedbackText,
        rating: rating
      });
      Alert.alert('Success', 'Thank you for your feedback!');
      setFeedbackVisible(false);
      setFeedbackText('');
      loadReports();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'under process': return '#2196F3';
      case 'assigning volunteer': return '#9C27B0';
      default: return '#757575';
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.premiumCard}>
      <View style={styles.cardHeader}>
        <View style={styles.imageBox}>
          {item.image ? (
            <Image
              source={{ uri: `${UPLOAD_URL}/${item.image}` }}
              style={styles.cardImage}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={{ fontSize: 10, color: '#999' }}>No Image</Text>
            </View>
          )}
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.typeRow}>
            <Title style={styles.cardType}>{item.garbage_type}</Title>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <MapPin size={12} color="#666" />
            <Text style={styles.locationText} numberOfLines={1}>{item.area}</Text>
          </View>

          <Paragraph numberOfLines={2} style={styles.cardDesc}>{item.description}</Paragraph>

          {/* Decision Status */}
          {item.authority_decision !== 'pending' && (
            <View style={[styles.decisionBox, { backgroundColor: item.authority_decision === 'agreed' ? '#E8F5E9' : '#FFEBEE' }]}>
              <Text style={[styles.decisionText, { color: item.authority_decision === 'agreed' ? '#2E7D32' : '#C62828' }]}>
                Govt: {item.authority_decision.toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.footerRow}>
            <Clock size={10} color="#999" />
            <Text style={styles.dateText}>{item.created_at.split(' ')[0]}</Text>
          </View>
        </View>
      </View>

      {/* Escalation Status */}
      {item.escalated_to_admin && (
        <View style={styles.escalationBar}>
          <AlertTriangle size={12} color="#fff" />
          <Text style={styles.escalationText}>Escalated to Admin</Text>
        </View>
      )}

      <Card.Actions style={styles.cardActions}>
        {item.status === 'Pending' && item.authority_decision === 'pending' && (
          <Button
            icon={() => <Edit2 size={16} color={theme.colors.primary} />}
            onPress={() => navigation.navigate('Report', { editReport: item })}
          >
            Edit
          </Button>
        )}

        {item.status === 'Resolved' && !item.citizen_feedback && (
          <Button
            mode="contained"
            buttonColor="#2E7D32"
            icon={() => <MessageSquare size={16} color="#fff" />}
            onPress={() => {
              setSelectedReport(item);
              setFeedbackVisible(true);
            }}
            style={styles.feedbackBtn}
          >
            Feedback
          </Button>
        )}

        {item.citizen_feedback && (
          <View style={styles.feedbackGiven}>
            <CheckCircle2 size={16} color="#4CAF50" />
            <Text style={styles.feedbackGivenText}>Feedback Sent</Text>
          </View>
        )}
      </Card.Actions>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <FlatList
        data={reports}
        renderItem={renderItem}
        keyExtractor={(item) => item.complaint_id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You haven't reported any garbage yet.</Text>
          </View>
        }
      />

      <Portal>
        <Modal
          visible={feedbackVisible}
          onDismiss={() => setFeedbackVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title>Report Feedback</Title>
          <Paragraph>How would you rate the resolution of your report?</Paragraph>

          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <IconButton
                key={star}
                icon="star"
                iconColor={rating >= star ? '#FFD700' : '#E0E0E0'}
                onPress={() => setRating(star)}
              />
            ))}
          </View>

          <TextInput
            label="Feedback Details"
            placeholder="Tell us about the cleaning quality..."
            multiline
            numberOfLines={4}
            value={feedbackText}
            onChangeText={setFeedbackText}
            mode="outlined"
            style={styles.textInput}
          />

          <View style={styles.modalActions}>
            <Button onPress={() => setFeedbackVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleFeedback}>Submit Feedback</Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingVertical: 16,
  },
  premiumCard: {
    marginHorizontal: 16,
    marginBottom: 20,
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
    backgroundColor: '#F0F0F0',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#444',
    marginTop: 6,
    lineHeight: 18,
  },
  decisionBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  decisionText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  dateText: {
    fontSize: 10,
    color: '#999',
    marginLeft: 4,
  },
  escalationBar: {
    backgroundColor: '#D32F2F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 6,
  },
  escalationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardActions: {
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 8,
    backgroundColor: '#FAFAFA',
  },
  feedbackGiven: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 12,
    gap: 6,
  },
  feedbackGivenText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  feedbackBtn: {
    borderRadius: 10,
    marginVertical: 6,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
  },
  textInput: {
    marginVertical: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
});

export default MyReportsScreen;
