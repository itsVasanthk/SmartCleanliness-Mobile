import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Text, Title, HelperText, useTheme, SegmentedButtons } from 'react-native-paper';
import { UserPlus } from 'lucide-react-native';
import { registerUser } from '../api/api';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await registerUser({ name, email, password, role });
      if (result.success) {
        Alert.alert('Success', 'Account created successfully! Please login.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <UserPlus color={theme.colors.primary} size={40} />
          </View>
          <Title style={styles.title}>Join Us</Title>
          <Text style={styles.subtitle}>Help us make Madurai clean</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            disabled={loading}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            disabled={loading}
          />

          <Text style={styles.label}>Register as</Text>
          <SegmentedButtons
            value={role}
            onValueChange={setRole}
            buttons={[
              { value: 'citizen', label: 'Citizen' },
              { value: 'authority', label: 'Authority' },
            ]}
            style={styles.segmented}
            disabled={loading}
          />

          {error ? <HelperText type="error" visible={!!error}>{error}</HelperText> : null}

          <Button 
            mode="contained" 
            onPress={handleRegister} 
            loading={loading} 
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Create Account
          </Button>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.link, { color: theme.colors.primary }]}>
              Already have an account? Login here
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 8,
  },
  segmented: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  link: {
    textAlign: 'center',
    marginTop: 24,
    fontWeight: '500',
  },
});

export default RegisterScreen;
