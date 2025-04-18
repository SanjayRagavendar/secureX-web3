import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const { authenticated, loading } = useAuth();

  // Show a loading spinner while checking authentication status
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2D3436" />
      </View>
    );
  }

  // Redirect based on authentication status
  return authenticated ? <Redirect href="/(tabs)" /> : <Redirect href="/auth/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
});