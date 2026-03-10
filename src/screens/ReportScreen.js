import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text, Title, HelperText, useTheme, SegmentedButtons, IconButton } from 'react-native-paper';
import { Camera, MapPin, Upload, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { submitReport, editReport, UPLOAD_URL } from '../api/api';

const ReportScreen = ({ navigation, route }) => {
  const { user, editReport: existingReport } = route.params;
  const isEditMode = !!existingReport;
  
  const [garbageType, setGarbageType] = useState(existingReport?.garbage_type || 'Organic');
  const [otherDescription, setOtherDescription] = useState(existingReport?.description || '');
  const [area, setArea] = useState(existingReport?.area || '');
  const [pincode, setPincode] = useState(existingReport?.pincode || '');
  const [landmark, setLandmark] = useState(existingReport?.landmark || '');
  const [image, setImage] = useState(existingReport?.image ? { uri: `${UPLOAD_URL}/${existingReport.image}`, isExisting: true } : null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    (async () => {
      const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (camStatus !== 'granted' || locStatus !== 'granted') {
        Alert.alert('Permission needed', 'Camera and Location permissions are required to report garbage.');
      }
    })();
  }, []);

  const pickImage = async (useCamera = true) => {
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
      setImage(result.assets[0]);
    }
  };

  const getCurrentLocation = async () => {
    setLocating(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync(location.coords);
      
      if (address.length > 0) {
        const addr = address[0];
        setArea(addr.district || addr.city || addr.subregion || '');
        setPincode(addr.postalCode || '');
        setLandmark(addr.name || addr.street || '');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not fetch location automatically.');
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert('Missing Image', 'Please take a photo of the garbage first.');
      return;
    }
    if (!area || !pincode) {
      Alert.alert('Missing Info', 'Please provide the area and pincode.');
      return;
    }

    setLoading(true);
    
    const formData = new FormData();
    formData.append('user_id', user.user_id.toString());
    formData.append('garbage_type', garbageType);
    formData.append('other_description', otherDescription);
    formData.append('area', area);
    formData.append('pincode', pincode);
    formData.append('landmark', landmark);
    
    if (image && !image.isExisting) {
        const filename = image.uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        
        formData.append('image', {
          uri: image.uri,
          name: filename,
          type: type,
        });
    } else if (isEditMode && image && image.isExisting) {
        formData.append('existing_image', existingReport.image);
    }

    try {
      let result;
      if (isEditMode) {
          result = await editReport(existingReport.complaint_id, formData);
      } else {
          result = await submitReport(formData);
      }

      if (result.success) {
        Alert.alert('Success', isEditMode ? 'Report updated successfully!' : 'Report submitted successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err) {
      if (err.message && err.message.includes("already used")) {
        Alert.alert('AI Detection: Duplicate', 'This image has already been used in another report. Please take a fresh photo.');
      } else {
        Alert.alert('Submission Failed', err.message || 'Check your connection');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Title style={styles.sectionTitle}>1. {isEditMode ? 'Update Photo (Optional)' : 'Capture Photo'}</Title>
      
      {image ? (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image.uri }} style={styles.imagePreview} />
          <IconButton 
            icon={() => <X color="#fff" size={20} />} 
            style={styles.removeImageIcon}
            onPress={() => setImage(null)}
          />
        </View>
      ) : (
        <View style={styles.imagePlaceholderContainer}>
          <TouchableOpacity style={styles.imagePlaceholder} onPress={() => pickImage(true)}>
            <Camera color={theme.colors.primary} size={48} />
            <Text style={styles.placeholderText}>Take a Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.galleryButton} onPress={() => pickImage(false)}>
            <Upload color={theme.colors.primary} size={20} />
            <Text style={[styles.galleryText, { color: theme.colors.primary }]}>Select from Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      <Title style={styles.sectionTitle}>2. Details</Title>
      
      <Text style={styles.label}>Garbage Type</Text>
      <SegmentedButtons
        value={garbageType}
        onValueChange={setGarbageType}
        buttons={[
          { value: 'Organic', label: 'Organic' },
          { value: 'Plastic', label: 'Plastic' },
          { value: 'Other', label: 'Other' },
        ]}
        style={styles.segmented}
      />

      <TextInput
        label="Describe waste"
        value={otherDescription}
        onChangeText={setOtherDescription}
        mode="outlined"
        style={styles.input}
        placeholder="e.g. Broken glass, medical waste, etc."
      />

      <View style={styles.locationHeader}>
        <Title style={styles.sectionTitle}>3. Location</Title>
        <Button 
          icon={() => <MapPin size={16} color={theme.colors.primary} />} 
          onPress={getCurrentLocation}
          loading={locating}
          disabled={locating}
        >
          Auto-Detect
        </Button>
      </View>

      <TextInput
        label="Area / Street"
        value={area}
        onChangeText={setArea}
        mode="outlined"
        style={styles.input}
      />
      
      <View style={styles.row}>
        <TextInput
          label="Pincode"
          value={pincode}
          onChangeText={setPincode}
          mode="outlined"
          keyboardType="number-pad"
          style={[styles.input, { flex: 1, marginRight: 8 }]}
        />
        <TextInput
          label="Landmark (Optional)"
          value={landmark}
          onChangeText={setLandmark}
          mode="outlined"
          style={[styles.input, { flex: 2 }]}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.submitButton}
        contentStyle={styles.submitButtonContent}
      >
        {isEditMode ? 'Update Report' : 'Submit Report'}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  imagePlaceholderContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  placeholderText: {
    marginTop: 12,
    color: '#666',
    fontWeight: '500',
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  galleryText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  segmented: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 12,
    marginBottom: 40,
  },
  submitButtonContent: {
    height: 56,
  },
});

export default ReportScreen;
