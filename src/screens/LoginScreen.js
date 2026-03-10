import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Title, HelperText, useTheme } from 'react-native-paper';
import { LogIn } from 'lucide-react-native';
import { loginUser } from '../api/api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await loginUser(email, password);
      if (result.success) {
        // Navigate based on role
        if (result.user.role === 'citizen') {
          navigation.replace('CitizenDashboard', { user: result.user });
        } else if (result.user.role === 'authority') {
          navigation.replace('AuthorityDashboard', { user: result.user });
        } else if (result.user.role === 'admin') {
          navigation.replace('AdminDashboard', { user: result.user });
        } else {
          alert('Role not recognized. Please contact support.');
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed');
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
            <LogIn color={theme.colors.primary} size={40} />
          </View>
          <Title style={styles.title}>Smart Cleanliness</Title>
          <Text style={styles.subtitle}>Clean City, Healthy Life</Text>
        </View>

        <View style={styles.form}>
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

          {error ? <HelperText type="error" visible={!!error}>{error}</HelperText> : null}

          <Button 
            mode="contained" 
            onPress={handleLogin} 
            loading={loading} 
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Login
          </Button>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.link, { color: theme.colors.primary }]}>
              Don't have an account? Register here
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
    marginBottom: 40,
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

export default LoginScreen;
