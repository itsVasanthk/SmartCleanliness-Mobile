import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, FlatList, TouchableOpacity } from 'react-native';
import { List, Card, Title, Paragraph, ActivityIndicator, useTheme, Chip, Text, Divider, Button } from 'react-native-paper';
import { Info, Map, Newspaper, Utensils, BookOpen, Clock, Bus, MapPin, CheckCircle, XCircle, Heart } from 'lucide-react-native';
import { fetchAwarenessData } from '../api/api';

const AwarenessScreen = () => {
  const [awarenessData, setAwarenessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('tourism');
  const theme = useTheme();

  const BASE_IMAGE_URL = 'http://10.212.38.3:5000/static/images/';

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchAwarenessData();
        setAwarenessData(result);
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

  const renderBusRoutes = (routes) => {
    if (!routes) return null;
    return (
      <View style={styles.busContainer}>
        <View style={styles.subHeader}>
          <Bus size={16} color="#444" />
          <Text style={styles.subTitle}>Bus Routes</Text>
        </View>
        {Object.entries(routes).map(([dest, nums]) => (
          <View key={dest} style={styles.routeRow}>
            <Text style={styles.routeDest}>{dest}: </Text>
            <Text style={styles.routeNums}>{nums}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderGuidelines = () => {
    const { dos, donts } = awarenessData.guidelines;
    return (
      <Card style={styles.mainCard}>
        <Card.Content>
          <View style={styles.guideHeader}>
            <CheckCircle size={24} color="#2E7D32" />
            <Title style={[styles.guideTitle, { color: '#2E7D32' }]}>Dos - Proper Habits</Title>
          </View>
          {dos.map((item, idx) => (
            <View key={idx} style={styles.guideItem}>
              <Heart size={14} color="#2E7D32" />
              <Text style={styles.guideText}>{item}</Text>
            </View>
          ))}
          
          <Divider style={styles.divider} />

          <View style={styles.guideHeader}>
            <XCircle size={24} color="#D32F2F" />
            <Title style={[styles.guideTitle, { color: '#D32F2F' }]}>Don'ts - Avoid These</Title>
          </View>
          {donts.map((item, idx) => (
            <View key={idx} style={styles.guideItem}>
              <XCircle size={14} color="#D32F2F" />
              <Text style={styles.guideText}>{item}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    );
  };

  const renderItems = () => {
    const items = awarenessData[selectedCategory];
    if (selectedCategory === 'guidelines') return renderGuidelines();

    return items.map((item) => (
      <Card key={item.id} style={styles.mainCard}>
        <Card.Cover source={{ uri: BASE_IMAGE_URL + item.image }} style={styles.cardImage} />
        <Card.Content style={styles.cardPadding}>
          <Title style={styles.itemTitle}>{item.name}</Title>
          <Paragraph style={styles.itemDesc}>{item.description}</Paragraph>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Clock size={16} color="#666" />
              <Text style={styles.infoText}>{item.timings}</Text>
            </View>
            <View style={styles.infoItem}>
              <MapPin size={16} color="#666" />
              <Text style={styles.infoText}>{item.duration || "Visit Tip"}</Text>
            </View>
          </View>

          {item.must_try && (
            <View style={styles.mustTryContainer}>
              <Text style={styles.subTitle}>Must Try:</Text>
              <View style={styles.chipRow}>
                {item.must_try.map((food, idx) => (
                  <Chip key={idx} style={styles.foodChip} textStyle={styles.foodChipText}>{food}</Chip>
                ))}
              </View>
            </View>
          )}

          {renderBusRoutes(item.bus_routes)}

          <Divider style={styles.divider} />
          
          <View style={styles.cleanlinessHeader}>
            <Title style={styles.cleanlinessTitle}>♻ Cleanliness & Hygiene</Title>
          </View>
          {(item.cleanliness_tips || item.hygiene_tips).map((tip, idx) => (
            <Text key={idx} style={styles.tipText}>• {tip}</Text>
          ))}
        </Card.Content>
      </Card>
    ));
  };

  return (
    <View style={styles.container}>
      <Card style={styles.header}>
        <Card.Content>
          <Title style={styles.title}>Explore Madurai 🕌</Title>
          <Paragraph>Everything you need to know about the Temple City.</Paragraph>
        </Card.Content>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <TouchableOpacity onPress={() => setSelectedCategory('tourism')} style={[styles.catBtn, selectedCategory === 'tourism' && styles.catBtnActive]}>
            <Map size={20} color={selectedCategory === 'tourism' ? '#fff' : '#1976D2'} />
            <Text style={[styles.catLabel, selectedCategory === 'tourism' && styles.catLabelActive]}>Tourism</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedCategory('temples')} style={[styles.catBtn, selectedCategory === 'temples' && styles.catBtnActive]}>
            <BookOpen size={20} color={selectedCategory === 'temples' ? '#fff' : '#7B1FA2'} />
            <Text style={[styles.catLabel, selectedCategory === 'temples' && styles.catLabelActive]}>Temples</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedCategory('food')} style={[styles.catBtn, selectedCategory === 'food' && styles.catBtnActive]}>
            <Utensils size={20} color={selectedCategory === 'food' ? '#fff' : '#D32F2F'} />
            <Text style={[styles.catLabel, selectedCategory === 'food' && styles.catLabelActive]}>Food Guide</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedCategory('guidelines')} style={[styles.catBtn, selectedCategory === 'guidelines' && styles.catBtnActive]}>
            <Info size={20} color={selectedCategory === 'guidelines' ? '#fff' : '#2E7D32'} />
            <Text style={[styles.catLabel, selectedCategory === 'guidelines' && styles.catLabelActive]}>Guidelines</Text>
          </TouchableOpacity>
        </ScrollView>
      </Card>

      <ScrollView style={styles.content}>
        {renderItems()}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    borderRadius: 0,
    elevation: 0, // Removed elevation to remove the line/shadow
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12, // Added vertical padding to reduce congestion
    flexDirection: 'row',
  },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#eee',
  },
  catBtnActive: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  catLabel: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#666',
  },
  catLabelActive: {
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  mainCard: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
  },
  cardImage: {
    height: 180,
  },
  cardPadding: {
    paddingTop: 12,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    lineHeight: 28,
  },
  itemDesc: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 6,
    color: '#666',
    fontSize: 12,
  },
  busContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
    marginLeft: 8,
  },
  routeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  routeDest: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  routeNums: {
    fontSize: 12,
    color: '#1976D2',
    flex: 1,
  },
  mustTryContainer: {
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  foodChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff0f0',
  },
  foodChipText: {
    fontSize: 11,
    color: '#d32f2f',
  },
  divider: {
    marginVertical: 12,
  },
  cleanlinessTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  tipText: {
    fontSize: 13,
    color: '#444',
    marginBottom: 4,
    paddingLeft: 4,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guideTitle: {
    marginLeft: 12,
    fontSize: 18,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 8,
  },
  guideText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
});

export default AwarenessScreen;
