import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, Paragraph, useTheme } from 'react-native-paper';
import { Truck } from 'lucide-react-native';
import { registerVehicleApi } from '../api/api';

const VehicleRegistration = ({ navigation, route }) => {
  const { user } = route.params;
  const [type, setType] = useState('');
  const [number, setNumber] = useState('');
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleRegister = async () => {
    if (!type || !number || !area) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await registerVehicleApi({
        user_id: user.user_id,
        type,
        number,
        area
      });
      Alert.alert('Success', 'Vehicle registered successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
          <Truck color={theme.colors.primary} size={40} />
        </View>
        <Title style={styles.title}>Vehicle Registration</Title>
        <Paragraph style={styles.subtitle}>
          Help transport waste from collection points to processing zones.
        </Paragraph>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Vehicle Type (e.g., Mini Truck, Van)"
          value={type}
          onChangeText={setType}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Vehicle Number"
          value={number}
          onChangeText={setNumber}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Preferred Service Area"
          value={area}
          onChangeText={setArea}
          mode="outlined"
          style={styles.input}
        />

        <Button 
          mode="contained" 
          onPress={handleRegister} 
          loading={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Register Vehicle
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default VehicleRegistration;
