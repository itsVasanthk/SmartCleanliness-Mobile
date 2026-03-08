import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Text, Title, Card, Paragraph, useTheme, ActivityIndicator } from 'react-native-paper';
import { Camera, ShieldQuestion, Upload, X, ShieldCheck } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { submitEmergencyRequest } from '../api/api';

const EmergencyRequestScreen = ({ navigation, route }) => {
  const { user } = route.params;
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [aadhaar, setAadhaar] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const pickImage = async (setter, useCamera = true) => {
    let result;
    if (useCamera) {
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
    }

    if (!result.canceled) {
      setter(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!reason || !amount || !aadhaar || !selfie) {
      Alert.alert('Missing Info', 'Please fill all fields and provide both images.');
      return;
    }

    if (parseFloat(amount) > 1000) {
      Alert.alert('Limit Exceeded', 'Maximum assistance is ₹1000.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('user_id', user.user_id.toString());
    formData.append('reason', reason);
    formData.append('amount', amount);

    // Process Aadhaar
    const aadhaarFilename = aadhaar.uri.split('/').pop();
    formData.append('aadhaar_image', {
      uri: aadhaar.uri,
      name: aadhaarFilename,
      type: 'image/jpeg',
    });

    // Process Selfie
    const selfieFilename = selfie.uri.split('/').pop();
    formData.append('selfie_image', {
      uri: selfie.uri,
      name: selfieFilename,
      type: 'image/jpeg',
    });

    try {
      const result = await submitEmergencyRequest(formData);
      if (result.success) {
        Alert.alert('Success', 'Request submitted! AI is verifying your identity.', [
          { text: 'View Status', onPress: () => navigation.navigate('EmergencyStatus', { user }) }
        ]);
      }
    } catch (err) {
      Alert.alert('Verification Failed', err.message || 'Identity mismatch detected.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <ShieldQuestion size={50} color={theme.colors.primary} />
        <Title style={styles.title}>Emergency Assistance</Title>
        <Paragraph style={styles.subtitle}>Identity verification is required for global help funds.</Paragraph>
      </View>

      <TextInput
        label="Reason for help"
        value={reason}
        onChangeText={setReason}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
        placeholder="e.g. Stranded without transport"
      />

      <TextInput
        label="Amount Requested (Max ₹1000)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="number-pad"
        mode="outlined"
        style={styles.input}
        left={<TextInput.Affix text="₹ " />}
      />

      <Title style={styles.sectionTitle}>Verification Step</Title>
      <Text style={styles.info}>AI will verify your Face against your Aadhaar.</Text>

      <View style={styles.imageRow}>
        <View style={styles.imageBox}>
          <Text style={styles.imageLabel}>Aadhaar Card</Text>
          {aadhaar ? (
            <View>
              <Image source={{ uri: aadhaar.uri }} style={styles.preview} />
              <IconButton icon="close" size={20} style={styles.removeBtn} onPress={() => setAadhaar(null)} />
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(setAadhaar, false)}>
              <Upload size={24} color={theme.colors.primary} />
              <Text style={styles.uploadText}>Upload ID</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.imageBox}>
          <Text style={styles.imageLabel}>Real-time Selfie</Text>
          {selfie ? (
            <View>
              <Image source={{ uri: selfie.uri }} style={styles.preview} />
              <IconButton icon="close" size={20} style={styles.removeBtn} onPress={() => setSelfie(null)} />
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(setSelfie, true)}>
              <Camera size={24} color={theme.colors.primary} />
              <Text style={styles.uploadText}>Take Selfie</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.submitBtn}
        contentStyle={styles.submitBtnContent}
      >
        Verify & Request
      </Button>

      <View style={styles.footerNote}>
        <ShieldCheck size={16} color="#4CAF50" />
        <Text style={styles.footerText}>Secured by DeepFace AI Verification</Text>
      </View>
    </ScrollView>
  );
};

// Simple IconButton replacement as it's common in paper but I'll use TouchableOpacity
const IconButton = ({ icon, onPress, style }) => (
  <TouchableOpacity onPress={onPress} style={[styles.iconButton, style]}>
    <X size={16} color="#fff" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#666', textAlign: 'center' },
  input: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  info: { color: '#666', marginBottom: 15 },
  imageRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  imageBox: { width: '48%' },
  imageLabel: { fontSize: 12, color: '#666', marginBottom: 5, textAlign: 'center' },
  uploadBtn: {
    height: 120,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  uploadText: { fontSize: 12, marginTop: 5, color: '#666' },
  preview: { height: 120, borderRadius: 8 },
  removeBtn: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.5)', padding: 4, borderRadius: 10 },
  submitBtn: { borderRadius: 12, marginTop: 10 },
  submitBtnContent: { height: 50 },
  footerNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  footerText: { marginLeft: 5, color: '#666', fontSize: 12 },
});

export default EmergencyRequestScreen;
