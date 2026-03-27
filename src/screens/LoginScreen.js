import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../services/api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Oops!', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser(email.trim(), password);
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      Alert.alert('Welcome back! 🎉', `Hey ${data.user.name}, good to see you!`);
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View style={styles.brandContainer}>
            <Text style={styles.brandName}>Campus<Text style={styles.brandAccent}>Kart</Text></Text>
            <Text style={styles.brandTagline}>Your campus marketplace</Text>
          </View>

          {/* Welcome Section */}
          <View style={styles.headerSection}>
            <Text style={styles.welcomeText}>Welcome{'\n'}back</Text>
            <Text style={styles.subtitleText}>Sign in to continue shopping</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@college.edu"
                  placeholderTextColor="#abadaf"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#abadaf"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#4647d3', '#9396ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginButton}
              >
                {loading ? (
                  <ActivityIndicator color="#f4f1ff" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Log In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Trust Badges */}
          <View style={styles.trustBadges}>
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>🛡️</Text>
              <Text style={styles.badgeText}>SECURE</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>🎓</Text>
              <Text style={styles.badgeText}>STUDENTS</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>🔐</Text>
              <Text style={styles.badgeText}>ENCRYPTED</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7f9',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4647d3',
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: '#b00d6a',
  },
  brandTagline: {
    fontSize: 13,
    color: '#595c5e',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  headerSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#2c2f31',
    letterSpacing: -1.5,
    lineHeight: 46,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: '#595c5e',
    marginTop: 8,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#2c2f31',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#595c5e',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef1f3',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#2c2f31',
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 18,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    color: '#4647d3',
    fontWeight: '600',
  },
  loginButton: {
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#f4f1ff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  signupText: {
    fontSize: 14,
    color: '#595c5e',
  },
  signupLink: {
    fontSize: 14,
    color: '#4647d3',
    fontWeight: '700',
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    gap: 32,
  },
  badge: {
    alignItems: 'center',
    gap: 6,
  },
  badgeIcon: {
    fontSize: 20,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#595c5e',
    letterSpacing: 1.5,
  },
});

export default LoginScreen;
