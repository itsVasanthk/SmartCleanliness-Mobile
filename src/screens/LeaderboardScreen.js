import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Title, Paragraph, List, Avatar, useTheme, Card, Text } from 'react-native-paper';
import { Award, Trophy } from 'lucide-react-native';
import { fetchLeaderboard } from '../api/api';

const LeaderboardScreen = () => {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaderboard = async () => {
    try {
      const result = await fetchLeaderboard();
      setData(result);
    } catch (error) {
      console.error("Leaderboard fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Paragraph style={{ marginTop: 10 }}>Calculating rankings...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Award size={64} color="#FFD700" />
        <Title style={styles.title}>Top Cleaners</Title>
        <Paragraph>Madurai's most active citizens</Paragraph>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.rank.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Trophy size={48} color="#ccc" />
            <Text style={styles.emptyText}>No data available yet.</Text>
            <Text style={styles.emptySubtext}>Start earning Carbon Credits to appear here!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <List.Item
              title={item.name}
              titleStyle={styles.userName}
              description={`${item.points} Carbon Credits`}
              descriptionStyle={styles.points}
              left={props => (
                <View style={styles.rankContainer}>
                    <Avatar.Text 
                      {...props} 
                      size={44} 
                      label={item.rank.toString()} 
                      labelStyle={{ fontWeight: 'bold' }}
                      style={{ 
                        backgroundColor: item.rank === 1 ? '#FFD700' : 
                                       item.rank === 2 ? '#C0C0C0' : 
                                       item.rank === 3 ? '#CD7F32' : '#F0F0F0' 
                      }} 
                    />
                </View>
              )}
            />
          </Card>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#2E7D32',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  points: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  rankContainer: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#999',
    marginTop: 8,
  }
});

export default LeaderboardScreen;
