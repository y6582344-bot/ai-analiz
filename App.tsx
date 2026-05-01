```react
import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  ActivityIndicator,
  Animated,
  PanResponder,
  Dimensions,
  StatusBar
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');

// JARVIS SİSTEMİ - HATASIZ VERSİYON
export default function App() {
  const [isFloatMode, setIsFloatMode] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Sistemler aktif efendim. Ekran görüntüsü alın ve göz (👁️) butonuna dokunun.", sender: 'ai' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const pan = useRef(new Animated.ValueXY({ x: width - 80, y: height - 250 })).current;

  useEffect(() => {
    (async () => {
      await MediaLibrary.requestPermissionsAsync();
    })();
  }, []);

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

  // API ANAHTARI
  const API_KEY = "AIzaSyBXCxSX0vx7nKTQVxerJ2s0778X-S_ShQ"; 

  const autoAnalyze = async () => {
    setLoading(true);
    try {
      const { assets } = await MediaLibrary.getAssetsAsync({
        first: 1,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
      });

      if (assets.length > 0) {
        const lastPhoto = assets[0];
        const base64Data = await FileSystem.readAsStringAsync(lastPhoto.uri, { encoding: FileSystem.EncodingType.Base64 });
        
        setMessages(prev => [...prev, { id: Date.now(), text: "Görüntü analiz ediliyor...", sender: 'user' }]);

        const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Sen Jarvis'sin. Bu son ekran görüntüsü. Brawl Stars gibi bir oyunsa taktik ver. Mesajsa ne yazmam gerektiğini söyle. Üslubun samimi, zeki ve delikanlı olsun." },
                { inlineData: { mimeType: "image/png", data: base64Data } }
              ]
            }]
          })
        });

        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Analiz başarısız.";
        setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: 'ai' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now(), text: "Göz sisteminde hata oluştu.", sender: 'ai' }]);
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
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Sen Jarvis'sin. 11. sınıf Beyşehirli bir gencin asistanısın. Soru: " + currentInput }] }]
        })
      });
      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Hata oluştu.";
      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: 'ai' }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now(), text: "Bağlantı koptu.", sender: 'ai' }]);
    } finally {
      setLoading(false);
    }
  };

  if (isFloatMode) {
    return (
      <View style={styles.container}>
        <Animated.View style={[pan.getLayout(), styles.floatingJarvis]} {...panResponder.panHandlers}>
          <TouchableOpacity onLongPress={() => setIsFloatMode(false)} style={styles.bubble}>
            <Text style={styles.bubbleText}>J</Text>
          </TouchableOpacity>
          <View style={styles.miniChat}>
            <ScrollView style={styles.miniScroll}><Text style={styles.miniAiText}>{messages[messages.length - 1].text}</Text></ScrollView>
            <View style={styles.miniInputRow}>
              <TouchableOpacity onPress={autoAnalyze} style={styles.eyeBtn}><Text style={{fontSize: 20}}>👁️</Text></TouchableOpacity>
              <TextInput style={styles.miniInput} placeholder="..." value={inputText} onChangeText={setInputText}/>
              <TouchableOpacity onPress={sendMessage} style={styles.miniSend}><Text style={{color:'#000'}}>></Text></TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior="height" style={styles.container}>
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
        {loading && <ActivityIndicator color="#00d2ff" />}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity onPress={autoAnalyze} style={styles.cameraBtn}><Text style={{fontSize: 28}}>👁️</Text></TouchableOpacity>
        <TextInput style={styles.mainInput} placeholder="Emredin efendim..." value={inputText} onChangeText={setInputText} multiline/>
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}><Text style={styles.sendBtnText}>SOR</Text></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19' },
  header: { paddingTop: 60, paddingBottom: 20, backgroundColor: '#161b22', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center' },
  headerTitle: { color: '#00d2ff', fontSize: 24, fontWeight: 'bold' },
  floatBtn: { backgroundColor: '#00d2ff', paddingVertical: 5, paddingHorizontal: 15, borderRadius: 20 },
  floatBtnText: { color: '#0b0f19', fontWeight: 'bold' },
  chatArea: { padding: 15 },
  msgBox: { padding: 15, borderRadius: 20, marginBottom: 12, maxWidth: '85%' },
  userBox: { alignSelf: 'flex-end', backgroundColor: '#00d2ff' },
  aiBox: { alignSelf: 'flex-start', backgroundColor: '#1c2128', borderLeftWidth: 4, borderLeftColor: '#00d2ff' },
  userTxt: { color: '#0b0f19' },
  aiTxt: { color: '#c9d1d9' },
  footer: { flexDirection: 'row', padding: 15, backgroundColor: '#161b22', alignItems: 'center' },
  cameraBtn: { marginRight: 10, backgroundColor: '#1c2128', padding: 10, borderRadius: 50 },
  mainInput: { flex: 1, color: '#fff', backgroundColor: '#0d1117', borderRadius: 25, paddingHorizontal: 20, marginRight: 10, maxHeight: 100 },
  sendBtn: { backgroundColor: '#00d2ff', paddingHorizontal: 20, borderRadius: 25, height: 50, justifyContent: 'center' },
  sendBtnText: { color: '#0b0f19', fontWeight: 'bold' },
  floatingJarvis: { position: 'absolute', alignItems: 'center', width: 220 },
  bubble: { width: 65, height: 65, borderRadius: 32.5, backgroundColor: '#00d2ff', justifyContent: 'center', alignItems: 'center', elevation: 15 },
  bubbleText: { fontSize: 35, fontWeight: 'bold', color: '#0b0f19' },
  miniChat: { backgroundColor: '#161b22', borderRadius: 15, marginTop: 10, padding: 10, width: 220, borderWidth: 1, borderColor: '#00d2ff' },
  miniAiText: { color: '#00d2ff', fontSize: 12 },
  miniInputRow: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
  eyeBtn: { backgroundColor: '#00d2ff', padding: 5, borderRadius: 50, marginRight: 5 },
  miniInput: { flex: 1, color: '#fff', fontSize: 12 },
  miniSend: { backgroundColor: '#00d2ff', width: 25, height: 25, borderRadius: 12.5, justifyContent: 'center', alignItems: 'center', marginLeft: 5 }
});

```
