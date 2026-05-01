```react
import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Animated,
  PanResponder,
  Dimensions,
  StatusBar
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [isFloatMode, setIsFloatMode] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Sistemler aktif efendim. Ben Jarvis. Size nasıl yardımcı olabilirim?", sender: 'ai' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Balonun başlangıç pozisyonu (Ekranın sağ altı)
  const pan = useRef(new Animated.ValueXY({ x: width - 80, y: height - 250 })).current;

  // Sürükleme Mantığı
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  // KRİTİK: API Anahtarını buraya yapıştır abi
  const API_KEY = ""; 

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText;
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Sen Jarvis'sin. Iron Man'in asistanı gibi zeki, sadık ve yardımsever ol. Kullanıcı 11. sınıfta bir Türk genci. Cevapların kısa, öz ve etkili olsun. Soru: ${currentInput}` }] }]
          })
        }
      );

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Bir hata oluştu efendim.";
      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: 'ai' }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now(), text: "Efendim, internet veya API bağlantısı koptu.", sender: 'ai' }]);
    } finally {
      setLoading(false);
    }
  };

  // --- YÜZEN (FLOATING) MOD GÖRÜNÜMÜ ---
  if (isFloatMode) {
    return (
      <View style={styles.fullContainer}>
        <StatusBar hidden />
        <Animated.View
          style={[pan.getLayout(), styles.floatingJarvis]}
          {...panResponder.panHandlers}
        >
          {/* Mavi Jarvis Balonu */}
          <TouchableOpacity 
            onLongPress={() => setIsFloatMode(false)} 
            style={styles.bubble}
            activeOpacity={0.8}
          >
            <View style={styles.bubbleCore} />
            <Text style={styles.bubbleText}>J</Text>
          </TouchableOpacity>

          {/* Mini Mesaj Kutusu (Yanda açılır) */}
          <View style={styles.miniChat}>
            <ScrollView style={styles.miniScroll}>
              <Text style={styles.miniAiText}>{messages[messages.length - 1].text}</Text>
            </ScrollView>
            <View style={styles.miniInputArea}>
              <TextInput 
                style={styles.miniInput} 
                placeholder="..." 
                placeholderTextColor="#555"
                value={inputText}
                onChangeText={setInputText}
              />
              <TouchableOpacity onPress={sendMessage} style={styles.miniSendBtn}>
                <Text style={{color: '#000', fontWeight: 'bold'}}>></Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  }

  // --- TAM EKRAN (SOHBET) MODU ---
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.fullContainer}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>JARVIS</Text>
        <TouchableOpacity style={styles.floatBtn} onPress={() => setIsFloatMode(true)}>
          <Text style={styles.floatBtnText}>Yüzen Mod</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.chatArea}>
        {messages.map((m) => (
          <View key={m.id} style={[styles.msgBox, m.sender === 'user' ? styles.userBox : styles.aiBox]}>
            <Text style={m.sender === 'user' ? styles.userTxt : styles.aiTxt}>{m.text}</Text>
          </View>
        ))}
        {loading && <ActivityIndicator color="#00d2ff" style={{marginTop: 10}} />}
      </ScrollView>

      <View style={styles.footer}>
        <TextInput
          style={styles.mainInput}
          placeholder="Emredin efendim..."
          placeholderTextColor="#666"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendBtnText}>GÖNDER</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: '#0b0f19' },
  header: { paddingTop: 50, paddingBottom: 20, backgroundColor: '#161b22', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#00d2ff' },
  headerTitle: { color: '#00d2ff', fontSize: 24, fontWeight: 'bold', letterSpacing: 3 },
  floatBtn: { backgroundColor: '#00d2ff', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 15 },
  floatBtnText: { color: '#0b0f19', fontWeight: 'bold', fontSize: 12 },
  chatArea: { padding: 15 },
  msgBox: { padding: 12, borderRadius: 18, marginBottom: 10, maxWidth: '85%' },
  userBox: { alignSelf: 'flex-end', backgroundColor: '#00d2ff' },
  aiBox: { alignSelf: 'flex-start', backgroundColor: '#1c2128', borderLeftWidth: 3, borderLeftColor: '#00d2ff' },
  userTxt: { color: '#0b0f19', fontSize: 15 },
  aiTxt: { color: '#c9d1d9', fontSize: 15 },
  footer: { flexDirection: 'row', padding: 15, backgroundColor: '#161b22' },
  mainInput: { flex: 1, color: '#fff', backgroundColor: '#0d1117', borderRadius: 20, paddingHorizontal: 15, marginRight: 10, maxHeight: 100 },
  sendBtn: { backgroundColor: '#00d2ff', borderRadius: 20, justifyContent: 'center', paddingHorizontal: 20 },
  sendBtnText: { color: '#0b0f19', fontWeight: 'bold' },

  // YÜZEN MOD STİLLERİ
  floatingJarvis: { position: 'absolute', alignItems: 'center', width: 180 },
  bubble: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#00d2ff', justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#00d2ff', shadowOpacity: 0.5, shadowRadius: 10 },
  bubbleCore: { position: 'absolute', width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#0b0f19', opacity: 0.2 },
  bubbleText: { fontSize: 30, fontWeight: 'bold', color: '#0b0f19' },
  miniChat: { backgroundColor: 'rgba(22, 27, 34, 0.95)', borderRadius: 12, marginTop: 8, padding: 8, width: 200, borderWidth: 1, borderColor: '#00d2ff' },
  miniScroll: { maxHeight: 80 },
  miniAiText: { color: '#00d2ff', fontSize: 12 },
  miniInputArea: { flexDirection: 'row', marginTop: 8, borderTopWidth: 1, borderTopColor: '#333', paddingTop: 5 },
  miniInput: { flex: 1, color: '#fff', fontSize: 11, padding: 2 },
  miniSendBtn: { backgroundColor: '#00d2ff', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginLeft: 5 }
});

```
