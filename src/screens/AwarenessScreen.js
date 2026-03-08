import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Card, Title, Paragraph, ActivityIndicator, useTheme } from 'react-native-paper';
import { Info, Map, Newspaper, Utensils, BookOpen } from 'lucide-react-native';
import { fetchAwarenessData } from '../api/api';

const AwarenessScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchAwarenessData();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title style={styles.headerTitle}>Awareness Center</Title>
          <Paragraph>Learn about Madurai and how to keep it clean.</Paragraph>
        </Card.Content>
      </Card>

      <List.Section>
        <List.Accordion
          title="Tourism in Madurai"
          left={props => <Map {...props} color="#1976D2" />}
        >
          <Card style={styles.contentCard}>
            <Card.Content>
              <Paragraph>{data?.tourism?.content}</Paragraph>
            </Card.Content>
          </Card>
        </List.Accordion>

        <List.Accordion
          title="Temple Guidelines"
          left={props => <BookOpen {...props} color="#7B1FA2" />}
        >
          <Card style={styles.contentCard}>
            <Card.Content>
              <Paragraph>{data?.temples?.content}</Paragraph>
            </Card.Content>
          </Card>
        </List.Accordion>

        <List.Accordion
          title="Food Culture"
          left={props => <Utensils {...props} color="#D32F2F" />}
        >
          <Card style={styles.contentCard}>
            <Card.Content>
              <Paragraph>{data?.food?.content}</Paragraph>
            </Card.Content>
          </Card>
        </List.Accordion>

        <List.Accordion
          title="Cleanliness 101"
          left={props => <Info {...props} color="#2E7D32" />}
        >
          <Card style={styles.contentCard}>
            <Card.Content>
              <Paragraph>{data?.guidelines?.content}</Paragraph>
            </Card.Content>
          </Card>
        </List.Accordion>
      </List.Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    margin: 16,
    backgroundColor: '#E8F5E9',
  },
  headerTitle: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  contentCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 0,
    backgroundColor: '#fff',
  },
});

export default AwarenessScreen;
