```react
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// BURAYA KENDİ GOOGLE API ANAHTARINI YAPIŞTIR
const API_KEY = ""; 

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Tactician Pro</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            Sistem Hazır! Bölünmüş ekran modunda kullanınız.
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>OTOMATİK TAKİBİ BAŞLAT</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { padding: 50, backgroundColor: '#1a73e8', alignItems: 'center' },
  title: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1, padding: 15 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 10, elevation: 3 },
  cardText: { fontSize: 16, color: '#333', textAlign: 'center' },
  button: { backgroundColor: '#1a73e8', padding: 20, margin: 20, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

```
