import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Image } from 'react-native';
import { Card, Text, Title, Paragraph, Chip, useTheme, ActivityIndicator } from 'react-native-paper';
import { fetchMyReports, UPLOAD_URL } from '../api/api';

const MyReportsScreen = ({ route }) => {
  const { user } = route.params;
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved': return '#4CAF50';
      case 'pending': return '#FF9800';
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
              textStyle={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }} 
              style={{ backgroundColor: getStatusColor(item.status), borderRadius: 6 }}
              compact
            >
              {item.status}
            </Chip>
          </View>
          <Paragraph numberOfLines={1} style={styles.description}>{item.description}</Paragraph>
          <Text style={styles.date}>{item.created_at}</Text>
          <Text style={styles.area}>{item.area}</Text>
        </View>
      </Card.Content>
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
  },
  cardContent: {
    flexDirection: 'row',
    padding: 8,
  },
  imageContainer: {
    width: 80,
    height: 80,
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
    justifyContent: 'center',
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
  },
  date: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  area: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '500',
    marginTop: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
});

export default MyReportsScreen;
