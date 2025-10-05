import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { scanOCR } from 'vision-camera-ocr';
import { runOnJS } from 'react-native-reanimated';
import * as Speech from 'expo-speech';
import { transliterate, type IndicScript } from './transliterate';

export default function CameraScreen() {
  const device = useCameraDevice('back');
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [target, setTarget] = useState<IndicScript>('devanagari');
  const [recognized, setRecognized] = useState<string>('');

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setAuthorized(status === 'granted');
    })();
  }, []);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const result = scanOCR(frame);
    // Join all text blocks into a single string
    const text = result?.result?.blocks?.map((b: any) => b.text).join(' ') ?? '';
    if (text && text.length > 0) {
      // @ts-expect-error: runOnJS is only available in worklet context
      runOnJS(setRecognized)(text);
    }
  }, []);

  // Stop any ongoing speech when text changes
  useEffect(() => {
    Speech.stop();
  }, [recognized]);

  const out = useMemo(() => transliterate(recognized, target), [recognized, target]);

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

  return (
    <View style={styles.container}>
      {device && authorized ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive
          frameProcessor={frameProcessor}
          frameProcessorFps={2}
        />
      ) : (
        <View style={styles.center}><Text>Waiting for camera permission...</Text></View>
      )}
      <View style={styles.overlay} pointerEvents="box-none">
        <Text style={styles.overlayText}>{out || 'Point camera at text…'}</Text>
        <View style={styles.scriptRow}>
          {SCRIPTS.map((s) => (
            <Pressable key={s} onPress={() => setTarget(s)} style={[styles.pill, target === s && styles.pillActive]}>
              <Text style={[styles.pillText, target === s && styles.pillTextActive]}>{s}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.controls}>
          <Pressable style={styles.button} onPress={() => Speech.speak(out)}>
            <Text style={styles.buttonText}>Speak</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  overlayText: { color: '#fff', fontSize: 20, marginBottom: 8 },
  scriptRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  pill: { borderWidth: 1, borderColor: '#ccc', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginRight: 6, marginBottom: 6 },
  pillActive: { backgroundColor: '#0a7', borderColor: '#0a7' },
  pillText: { fontSize: 12, color: '#fff', textTransform: 'capitalize' },
  pillTextActive: { color: '#fff' },
  controls: { flexDirection: 'row', gap: 12 },
  button: { backgroundColor: '#0a7', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
