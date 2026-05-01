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
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

/**
 * JARVIS V2.0 - Gözlü ve Yüzen Modlu Asistan
 * Beyşehir'den 11. Sınıf Dâhisi İçin Özel Üretim
 */
export default function App() {
  const [isFloatMode, setIsFloatMode] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Sistemler aktif efendim. Gözlerim açık, analiz için hazır bekliyorum.", sender: 'ai' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Balon pozisyonu (Ekranın sağ alt tarafı)
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
      onPanResponderRelease: () => pan.flattenOffset(),
    })
  ).current;

  // Resimden okuduğum API Anahtarın
  const API_KEY = "AIzaSyAh4p-M7iN0e_f63-u9A7I8O-2z8v_v_M8"; 

  // GÖRSEL ANALİZ (EKRAN GÖRÜNTÜSÜ OKUMA) FONKSİYONU
  const analyzeImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].base64) {
        setLoading(true);
        const base64Data = result.assets[0].base64;
        
        setMessages(prev => [...prev, { id: Date.now(), text: "[Görüntü Analiz Ediliyor...]", sender: 'user' }]);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: "Sen Jarvis'sin. Bu bir ekran görüntüsü. Eğer Brawl Stars gibi bir oyunsa taktik ver. Eğer bir kızla konuşmaysa ne yazmam gerektiğini söyle. Üslubun samimi, zeki ve delikanlı olsun." },
                  { inlineData: { mimeType: "image/png", data: base64Data } }
                ]
              }]
            })
          }
        );

        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Efendim, görüntüyü çözemedim.";
        setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: 'ai' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now(), text: "Gözlerimde bir sorun var efendim, tekrar deneyin.", sender: 'ai' }]);
    } finally {
      setLoading(false);
    }
  };

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
            contents: [{ parts: [{ text: `Sen Jarvis'sin. Kullanıcı 11. sınıfta bir Türk genci. Zeki ve yardımsever ol. Kısa cevaplar ver. Soru: ${currentInput}` }] }]
          })
        }
      );
      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Efendim bir hata oluştu.";
      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: 'ai' }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now(), text: "Bağlantı koptu efendim.", sender: 'ai' }]);
    } finally {
      setLoading(false);
    }
  };

  // --- YÜZEN (J) MODU ---
  if (isFloatMode) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <Animated.View style={[pan.getLayout(), styles.floatingJarvis]} {...panResponder.panHandlers}>
          <TouchableOpacity onLongPress={() => setIsFloatMode(false)} style={styles.bubble} activeOpacity={0.8}>
            <Text style={styles.bubbleText}>J</Text>
          </TouchableOpacity>
          <View style={styles.miniChat}>
            <ScrollView style={styles.miniScroll}><Text style={styles.miniAiText}>{messages[messages.length - 1].text}</Text></ScrollView>
            <View style={styles.miniInputRow}>
              <TouchableOpacity onPress={analyzeImage} style={styles.miniEye}><Text style={{fontSize: 16}}>👁️</Text></TouchableOpacity>
              <TextInput style={styles.miniInput} placeholder="..." placeholderTextColor="#444" value={inputText} onChangeText={setInputText}/>
              <TouchableOpacity onPress={sendMessage} style={styles.miniSend}><Text style={{color: '#000'}}>></Text></TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  }

  // --- TAM EKRAN SOHBET MODU ---
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>JARVIS</Text>
        <TouchableOpacity style={styles.modeBtn} onPress={() => setIsFloatMode(true)}>
          <Text style={styles.modeBtnText}>Yüzen Mod</Text>
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
        <TouchableOpacity onPress={analyzeImage} style={styles.cameraBtn}><Text style={{fontSize: 24}}>👁️</Text></TouchableOpacity>
        <TextInput style={styles.mainInput} placeholder="Emredin efendim..." placeholderTextColor="#666" value={inputText} onChangeText={setInputText} multiline/>
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}><Text style={styles.sendBtnText}>GÖNDER</Text></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19' },
  header: { paddingTop: 60, paddingBottom: 20, backgroundColor: '#161b22', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#00d2ff' },
  headerTitle: { color: '#00d2ff', fontSize: 24, fontWeight: 'bold', letterSpacing: 4 },
  modeBtn: { backgroundColor: '#00d2ff', paddingVertical: 5, paddingHorizontal: 15, borderRadius: 20 },
  modeBtnText: { color: '#0b0f19', fontWeight: 'bold', fontSize: 12 },
  chatArea: { padding: 15 },
  msgBox: { padding: 15, borderRadius: 20, marginBottom: 12, maxWidth: '85%' },
  userBox: { alignSelf: 'flex-end', backgroundColor: '#00d2ff' },
  aiBox: { alignSelf: 'flex-start', backgroundColor: '#1c2128', borderLeftWidth: 4, borderLeftColor: '#00d2ff' },
  userTxt: { color: '#0b0f19', fontSize: 15 },
  aiTxt: { color: '#c9d1d9', fontSize: 15 },
  footer: { flexDirection: 'row', padding: 15, backgroundColor: '#161b22', alignItems: 'center' },
  cameraBtn: { marginRight: 10, backgroundColor: '#1c2128', padding: 10, borderRadius: 50, borderWide: 1, borderColor: '#00d2ff' },
  mainInput: { flex: 1, color: '#fff', backgroundColor: '#0d1117', borderRadius: 25, paddingHorizontal: 20, marginRight: 10, maxHeight: 100 },
  sendBtn: { backgroundColor: '#00d2ff', height: 50, paddingHorizontal: 20, borderRadius: 25, justifyContent: 'center' },
  sendBtnText: { color: '#0b0f19', fontWeight: 'bold' },
  floatingJarvis: { position: 'absolute', alignItems: 'center', width: 220 },
  bubble: { width: 65, height: 65, borderRadius: 32.5, backgroundColor: '#00d2ff', justifyContent: 'center', alignItems: 'center', elevation: 15, shadowColor: '#00d2ff', shadowOpacity: 0.5, shadowRadius: 10 },
  bubbleText: { fontSize: 35, fontWeight: 'bold', color: '#0b0f19' },
  miniChat: { backgroundColor: 'rgba(22, 27, 34, 0.98)', borderRadius: 15, marginTop: 10, padding: 10, width: 220, borderWidth: 1, borderColor: '#00d2ff' },
  miniScroll: { maxHeight: 100 },
  miniAiText: { color: '#00d2ff', fontSize: 13 },
  miniInputRow: { flexDirection: 'row', marginTop: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#333', paddingTop: 8 },
  miniEye: { backgroundColor: '#00d2ff', padding: 5, borderRadius: 50, marginRight: 5 },
  miniInput: { flex: 1, color: '#fff', fontSize: 12 },
  miniSend: { backgroundColor: '#00d2ff', width: 25, height: 25, borderRadius: 12.5, justifyContent: 'center', alignItems: 'center', marginLeft: 5 }
});

```
