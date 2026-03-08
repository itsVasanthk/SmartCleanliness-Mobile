import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Card, Title, Paragraph, useTheme, ActivityIndicator, RadioButton, Divider } from 'react-native-paper';
import { Heart, CreditCard, CheckCircle, Smartphone, Landmark, Wallet } from 'lucide-react-native';
import { createRazorpayOrder, verifyPayment } from '../api/api';

const DonationScreen = ({ navigation, route }) => {
  const { user } = route.params;
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('upi');
  const theme = useTheme();

  const handleDonate = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid donation amount.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create Order
      const order = await createRazorpayOrder(amount);
      
      // 2. Simulate Payment Selection
      Alert.alert(
        'Payment Gateway', 
        `Redirecting to Razorpay via ${method.toUpperCase()}...`,
        [
          {
            text: 'Simulate Success',
            onPress: async () => {
              try {
                const verification = await verifyPayment({
                  razorpay_order_id: order.order_id,
                  razorpay_payment_id: 'pay_test_' + Math.random().toString(36).substr(2, 9),
                  razorpay_signature: 'simulated_signature',
                  user_id: user.user_id,
                  amount: amount // Pass amount for server-side simulation
                });
                
                if (verification.success) {
                  Alert.alert('Thank You!', 'Your donation has been received. Madurai thanks you!');
                  navigation.goBack();
                } else {
                  Alert.alert('Verification Failed', verification.message);
                }
              } catch (err) {
                Alert.alert('Verification Failed', err.message);
              }
            }
          },
          {
            text: 'Simulate Failure',
            onPress: () => Alert.alert('Payment Failed', 'User cancelled or transaction failed.')
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );

    } catch (err) {
      Alert.alert('Order Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Heart size={64} color="#E91E63" fill="#E91E63" />
        <Title style={styles.title}>Donate to Madurai</Title>
        <Paragraph style={styles.subtitle}>
          Secure Madurai's hygiene future with your contribution.
        </Paragraph>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Contribution Amount (INR)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
            mode="outlined"
            placeholder="e.g. 500"
            left={<TextInput.Affix text="₹ " />}
            style={styles.input}
          />

          <View style={styles.quickAmounts}>
            {[100, 200, 500, 1000].map((val) => (
              <Button 
                key={val} 
                mode={amount === val.toString() ? "contained" : "outlined"}
                onPress={() => setAmount(val.toString())}
                style={styles.amountButton}
              >
                ₹{val}
              </Button>
            ))}
          </View>

          <Divider style={styles.divider} />
          
          <Text style={styles.label}>Select Payment Method</Text>
          <RadioButton.Group onValueChange={newValue => setMethod(newValue)} value={method}>
            <View style={styles.methodRow}>
              <View style={styles.methodItem}>
                <TouchableOpacity style={styles.methodTouch} onPress={() => setMethod('upi')}>
                   <Smartphone size={20} color={method === 'upi' ? theme.colors.primary : '#666'} />
                   <Text style={[styles.methodText, method === 'upi' && styles.activeMethod]}>UPI / GPay</Text>
                   <RadioButton value="upi" />
                </TouchableOpacity>
              </View>
              <View style={styles.methodItem}>
                <TouchableOpacity style={styles.methodTouch} onPress={() => setMethod('card')}>
                   <CreditCard size={20} color={method === 'card' ? theme.colors.primary : '#666'} />
                   <Text style={[styles.methodText, method === 'card' && styles.activeMethod]}>Debit/Credit</Text>
                   <RadioButton value="card" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.methodRow}>
              <View style={styles.methodItem}>
                <TouchableOpacity style={styles.methodTouch} onPress={() => setMethod('net')}>
                   <Landmark size={20} color={method === 'net' ? theme.colors.primary : '#666'} />
                   <Text style={[styles.methodText, method === 'net' && styles.activeMethod]}>Netbanking</Text>
                   <RadioButton value="net" />
                </TouchableOpacity>
              </View>
              <View style={styles.methodItem}>
                <TouchableOpacity style={styles.methodTouch} onPress={() => setMethod('wallet')}>
                   <Wallet size={20} color={method === 'wallet' ? theme.colors.primary : '#666'} />
                   <Text style={[styles.methodText, method === 'wallet' && styles.activeMethod]}>Wallets</Text>
                   <RadioButton value="wallet" />
                </TouchableOpacity>
              </View>
            </View>
          </RadioButton.Group>

          <Button
            mode="contained"
            onPress={handleDonate}
            loading={loading}
            disabled={loading}
            style={styles.payButton}
            contentStyle={styles.payButtonContent}
          >
            Pay Securely
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.infoBox}>
        <CheckCircle size={16} color="#4CAF50" />
        <Text style={styles.infoText}>Razorpay Secured • Test Mode Enabled</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginTop: 4,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    elevation: 3,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    marginBottom: 15,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  amountButton: {
    flex: 1,
    marginHorizontal: 3,
  },
  divider: {
    marginVertical: 15,
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  methodItem: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    margin: 4,
    padding: 4,
  },
  methodTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 8,
  },
  methodText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    marginLeft: 8,
  },
  activeMethod: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  payButton: {
    borderRadius: 12,
    backgroundColor: '#2E7D32',
    marginTop: 20,
  },
  payButtonContent: {
    height: 52,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  infoText: {
    marginLeft: 6,
    color: '#888',
    fontSize: 12,
  },
});

export default DonationScreen;
