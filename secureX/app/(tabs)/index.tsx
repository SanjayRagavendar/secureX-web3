import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';

// Define TypeScript interfaces for our data structures
interface WalletData {
  balance: string;
  currency: string;
  userName: string;
}

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: string;
  date: string;
  status: string;
}

// Mock API functions with proper return types
const fetchWalletData = async (): Promise<WalletData> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    balance: '5,234.50',
    currency: '$',
    userName: 'John Doe'
  };
};

const fetchTransactions = async (): Promise<Transaction[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  return [
    {
      id: '1',
      type: 'send',
      amount: '$250.00',
      date: 'Today, 2:30 PM',
      status: 'Completed'
    },
    {
      id: '2',
      type: 'receive',
      amount: '$1,000.00',
      date: 'Yesterday',
      status: 'Completed'
    },
    {
      id: '3',
      type: 'send',
      amount: '$75.00',
      date: 'Mar 15',
      status: 'Pending'
    }
  ];
};

interface WalletCardProps {
  balance: string;
  currency: string;
  isLoading: boolean;
}

const WalletCard = ({ balance, currency, isLoading }: WalletCardProps) => (
  <LinearGradient
    colors={['#2D3436', '#000000']}
    style={styles.walletCard}
  >
    <Text style={styles.walletLabel}>Total Balance</Text>
    {isLoading ? (
      <ActivityIndicator color="white" size="large" />
    ) : (
      <Text style={styles.walletBalance}>{currency}{balance}</Text>
    )}
    <View style={styles.walletActions}>
      <TouchableOpacity style={styles.actionButton}>
        <MaterialCommunityIcons name="send" size={24} color="white" />
        <Text style={styles.actionText}>Send</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton}>
        <MaterialCommunityIcons name="qrcode-scan" size={24} color="white" />
        <Text style={styles.actionText}>Scan</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton}>
        <MaterialCommunityIcons name="bank-transfer" size={24} color="white" />
        <Text style={styles.actionText}>Receive</Text>
      </TouchableOpacity>
    </View>
  </LinearGradient>
);

interface TransactionItemProps {
  type: 'send' | 'receive';
  amount: string;
  date: string;
  status: string;
}

const TransactionItem = ({ type, amount, date, status }: TransactionItemProps) => (
  <TouchableOpacity style={styles.transactionItem}>
    <View style={styles.transactionIcon}>
      <MaterialCommunityIcons 
        name={type === 'send' ? 'arrow-up-circle' : 'arrow-down-circle'} 
        size={32} 
        color={type === 'send' ? '#FF4757' : '#2ED573'}
      />
    </View>
    <View style={styles.transactionDetails}>
      <Text style={styles.transactionTitle}>
        {type === 'send' ? 'Sent' : 'Received'}
      </Text>
      <Text style={styles.transactionDate}>{date}</Text>
    </View>
    <View style={styles.transactionAmount}>
      <Text style={[
        styles.amountText,
        { color: type === 'send' ? '#FF4757' : '#2ED573' }
      ]}>
        {type === 'send' ? '-' : '+'}{amount}
      </Text>
      <Text style={styles.statusText}>{status}</Text>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const [walletData, setWalletData] = useState<WalletData>({
    balance: '0.00',
    currency: '$',
    userName: ''
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingWallet, setIsLoadingWallet] = useState<boolean>(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(true);
  const {authenticated } = useAuth();
  
  useEffect(() => {
    // Fetch wallet data when component mounts
    const loadWalletData = async () => {
      try {
        const data = await fetchWalletData();
        setWalletData(data);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setIsLoadingWallet(false);
      }
      console.log('Authenticated:', authenticated);
    };
    
    // Fetch transaction data when component mounts
    const loadTransactions = async () => {
      try {
        const data = await fetchTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoadingTransactions(false);
      }
    };
    
    loadWalletData();
    loadTransactions();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.nameText}>
              {isLoadingWallet ? 'Loading...' : walletData.userName}
            </Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <MaterialCommunityIcons name="account-circle" size={40} color="#333" />
          </TouchableOpacity>
        </View>

        <WalletCard 
          balance={walletData.balance} 
          currency={walletData.currency} 
          isLoading={isLoadingWallet}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          
          {isLoadingTransactions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#333" />
              <Text style={styles.loadingText}>Loading transactions...</Text>
            </View>
          ) : transactions.length === 0 ? (
            <Text style={styles.noTransactionsText}>No transactions found</Text>
          ) : (
            transactions.map((transaction: Transaction) => (
              <TransactionItem 
                key={transaction.id}
                type={transaction.type}
                amount={transaction.amount}
                date={transaction.date}
                status={transaction.status}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  profileButton: {
    padding: 5,
  },
  walletCard: {
    margin: 20,
    padding: 20,
    borderRadius: 15,
    height: 180,
  },
  walletLabel: {
    color: '#ffffff80',
    fontSize: 16,
  },
  walletBalance: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 10,
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    marginTop: 5,
    fontSize: 12,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2d3436',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  transactionIcon: {
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  transactionDate: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
  },
  noTransactionsText: {
    textAlign: 'center',
    padding: 20,
    color: '#7f8c8d',
  }
});
