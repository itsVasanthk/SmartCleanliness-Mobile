import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Paragraph, List, Avatar, useTheme } from 'react-native-paper';
import { Award } from 'lucide-react-native';

const LeaderboardScreen = () => {
  const theme = useTheme();
  
  const dummyData = [
    { name: 'Vasanth', points: 1500, rank: 1 },
    { name: 'User123', points: 1200, rank: 2 },
    { name: 'EcoWarrior', points: 1000, rank: 3 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Award size={60} color="#FFD700" />
        <Title style={styles.title}>Top Cleaners</Title>
        <Paragraph>Madurai's most active citizens</Paragraph>
      </View>

      <List.Section>
        {dummyData.map((item) => (
          <List.Item
            key={item.rank}
            title={item.name}
            description={`${item.points} Carbon Credits`}
            left={props => (
              <Avatar.Text 
                {...props} 
                size={40} 
                label={item.rank.toString()} 
                style={{ backgroundColor: item.rank === 1 ? '#FFD700' : '#E0E0E0' }} 
              />
            )}
          />
        ))}
      </List.Section>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
});

export default LeaderboardScreen;
