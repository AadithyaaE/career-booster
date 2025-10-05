import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import { transliterate, type IndicScript } from './src/transliterate';

const SCRIPTS: IndicScript[] = [
  'devanagari',
  'gurmukhi',
  'bengali',
  'gujarati',
  'oriya',
  'tamil',
  'telugu',
  'kannada',
  'malayalam',
  'iast',
];

type Tab = 'text' | 'camera';

export default function App() {
  const [tab, setTab] = useState<Tab>('text');
  const [input, setInput] = useState('दिल्ली');
  const [target, setTarget] = useState<IndicScript>('gurmukhi');
  const out = useMemo(() => transliterate(input, target), [input, target]);

  useEffect(() => {
    Speech.stop();
  }, [out]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bharat Transliterator</Text>
      <View style={styles.tabs}>
        <Pressable onPress={() => setTab('text')} style={[styles.tab, tab === 'text' && styles.tabActive]}>
          <Text style={[styles.tabText, tab === 'text' && styles.tabTextActive]}>Text</Text>
        </Pressable>
        <Pressable onPress={() => setTab('camera')} style={[styles.tab, tab === 'camera' && styles.tabActive]}>
          <Text style={[styles.tabText, tab === 'camera' && styles.tabTextActive]}>Camera</Text>
        </Pressable>
      </View>
      {tab === 'text' ? (
      <TextInput
        style={styles.input}
        placeholder="Type or paste text"
        value={input}
        onChangeText={setInput}
        multiline
      />
      <View style={styles.pickerRow}>
        {SCRIPTS.map((s) => (
          <Pressable
            key={s}
            onPress={() => setTarget(s)}
            style={[styles.pill, target === s && styles.pillActive]}
          >
            <Text style={[styles.pillText, target === s && styles.pillTextActive]}>{s}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.outputBox}>
        <Text style={styles.outputText}>{out}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={() => Clipboard.setStringAsync(out)} style={styles.button}>
          <Text style={styles.buttonText}>Copy</Text>
        </Pressable>
        <Pressable onPress={() => Speech.speak(out)} style={styles.button}>
          <Text style={styles.buttonText}>Speak</Text>
        </Pressable>
        <Pressable onPress={() => setInput(out)} style={styles.buttonSecondary}>
          <Text style={styles.buttonText}>Swap ⟲</Text>
        </Pressable>
      </View>
      ) : (
        <View style={styles.cameraContainer}>
          {Platform.OS === 'web' ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text>Camera not available on web. Build native app.</Text>
            </View>
          ) : (
            // Dynamically require to avoid bundling on web
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            (() => {
              const CameraScreen = require('./src/CameraScreen').default as React.ComponentType;
              return <CameraScreen />;
            })()
          )}
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 64,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: { borderWidth: 1, borderColor: '#ccc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  tabActive: { backgroundColor: '#0a7', borderColor: '#0a7' },
  tabText: { color: '#333' },
  tabTextActive: { color: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    marginBottom: 12,
  },
  cameraContainer: { flex: 1, minHeight: 400, overflow: 'hidden', borderRadius: 12 },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 6,
    marginBottom: 6,
  },
  pillActive: {
    backgroundColor: '#0a7',
    borderColor: '#0a7',
  },
  pillText: {
    fontSize: 12,
    color: '#333',
    textTransform: 'capitalize',
  },
  pillTextActive: {
    color: '#fff',
  },
  outputBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
  },
  outputText: {
    fontSize: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    backgroundColor: '#222',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonSecondary: {
    backgroundColor: '#4a4a4a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
