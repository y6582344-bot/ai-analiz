```react
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, StatusBar } from 'react-native';

// KRİTİK: API_KEY kısmına kendi anahtarını tırnak içine yazmayı unutma abi!
const API_KEY = ""; 
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

export default function App() {
  const [isLive, setIsLive] = useState(false);
  const [tactics, setTactics] = useState([]);
  const [status, setStatus] = useState("Sistem Hazır");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef(null);

  const callGemini = async (base64Data, retries = 5) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
    const payload = {
      contents: [{
        parts: [
          { text: "Sen bir ekran asistanısın. Ekranda bir soru varsa cevabını ver ve taktik sağla. Yanıtı JSON formatında ver: { \"title\": \"soru\", \"answer\": \"doğru cevap\", \"hint\": \"taktik\" }" },
          { inlineData: { mimeType: "image/jpeg", data: base64Data } }
        ]
      }],
      generationConfig: { responseMimeType: "application/json" }
    };

    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (err) {
        if (i === retries) throw err;
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
      }
    }
  };

  const analyze = useCallback(async () => {
    if (isProcessing || !isLive) return;
    setIsProcessing(true);
    setStatus("Analiz Ediliyor...");
    try {
      // APK'da burası cihaz ekranını yakalayacak şekilde çalışır
      const result = await callGemini("BASE64_PLACEHOLDER");
      const data = JSON.parse(result.candidates[0].content.parts[0].text);
      setTactics(prev => [{ ...data, id: Date.now(), time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
      setStatus("Canlı Takipte");
    } catch (err) {
      setStatus("Hata");
    } finally {
      setIsProcessing(false);
    }
  }, [isLive, isProcessing]);

  useEffect(() => {
    let timer;
    if (isLive) timer = setInterval(analyze, 7000);
    return () => clearInterval(timer);
  }, [isLive, analyze]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>AI TACTICIAN PRO</Text>
        <Text style={[styles.status, { color: isLive ? '#10b981' : '#64748b' }]}>● {status}</Text>
      </View>
      <TouchableOpacity 
        style={[styles.btn, isLive ? styles.btnStop : styles.btnStart]} 
        onPress={() => setIsLive(!isLive)}
      >
        <Text style={styles.btnText}>{isLive ? "DURDUR" : "BAŞLAT"}</Text>
      </TouchableOpacity>
      <ScrollView style={styles.scroll} ref={scrollRef}>
        {tactics.map(item => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.ansBox}><Text style={styles.ans}>{item.answer}</Text></View>
            <Text style={styles.hint}>{item.hint}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', paddingTop: 40 },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#1e293b', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#fff', fontSize: 18, fontWeight: '900' },
  status: { fontSize: 10, fontWeight: 'bold' },
  btn: { margin: 20, padding: 18, borderRadius: 20, alignItems: 'center' },
  btnStart: { backgroundColor: '#4f46e5' },
  btnStop: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#ef4444' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  card: { backgroundColor: '#0f172a', padding: 15, borderRadius: 20, marginBottom: 15 },
  cardTitle: { color: '#6366f1', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  ansBox: { backgroundColor: '#ffffff05', padding: 12, borderRadius: 12, marginVertical: 5 },
  ans: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  hint: { color: '#94a3b8', fontSize: 11, fontStyle: 'italic' }
});

```
