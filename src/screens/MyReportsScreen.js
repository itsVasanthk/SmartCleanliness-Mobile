import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Image, Alert } from 'react-native';
import { Card, Text, Title, Paragraph, Chip, useTheme, ActivityIndicator, Button, Portal, Modal, IconButton, TextInput, Divider } from 'react-native-paper';
import { fetchMyReports, UPLOAD_URL, submitFeedback } from '../api/api';
import { Edit2, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react-native';

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
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image 
              source={{ uri: `${UPLOAD_URL}/${item.image}` }} 
              style={styles.image} 
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text>No Image</Text>
            </View>
          )}
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Title style={styles.garbageType}>{item.garbage_type}</Title>
            <Chip 
              textStyle={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }} 
              style={{ backgroundColor: getStatusColor(item.status), borderRadius: 6 }}
              compact
            >
              {item.status.toUpperCase()}
            </Chip>
          </View>
          <Paragraph numberOfLines={1} style={styles.description}>{item.description}</Paragraph>
          
          {/* Decision Status */}
          {item.authority_decision !== 'pending' && (
              <View style={[styles.decisionBox, { backgroundColor: item.authority_decision === 'agreed' ? '#E8F5E9' : '#FFEBEE' }]}>
                  <Text style={[styles.decisionText, { color: item.authority_decision === 'agreed' ? '#2E7D32' : '#C62828' }]}>
                      Govt Decision: {item.authority_decision.toUpperCase()}
                  </Text>
                  {item.authority_reason && (
                      <Text style={styles.reasonText}>Reason: {item.authority_reason}</Text>
                  )}
              </View>
          )}

          {/* Escalation Status */}
          {item.escalated_to_admin && (
              <View style={styles.escalationBox}>
                  <AlertTriangle size={14} color="#D32F2F" />
                  <Text style={styles.escalationText}>Escalated to Admin for Resolution</Text>
              </View>
          )}

          <View style={styles.footerRow}>
            <Text style={styles.date}>{item.created_at}</Text>
            <Text style={styles.area}>{item.area}</Text>
          </View>
        </View>
      </Card.Content>
      
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
            icon={() => <MessageSquare size={16} color="#4CAF50" />} 
            textColor="#4CAF50"
            onPress={() => {
                setSelectedReport(item);
                setFeedbackVisible(true);
            }}
          >
            Feedback
          </Button>
        )}

        {item.citizen_feedback && (
            <View style={styles.feedbackGiven}>
                <CheckCircle2 size={14} color="#4CAF50" />
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
    <View style={{ flex: 1 }}>
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
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  garbageType: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  decisionBox: {
    padding: 6,
    borderRadius: 6,
    marginBottom: 6,
  },
  decisionText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  reasonText: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 2,
  },
  escalationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 6,
    borderRadius: 6,
    marginBottom: 6,
    gap: 4,
  },
  escalationText: {
    fontSize: 10,
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  date: {
    fontSize: 10,
    color: '#999',
  },
  area: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: '500',
  },
  cardActions: {
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingHorizontal: 8,
  },
  feedbackGiven: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 8,
  },
  feedbackGivenText: {
      fontSize: 12,
      color: '#4CAF50',
      fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
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
