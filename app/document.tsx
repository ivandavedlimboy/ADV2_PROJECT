import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '@/config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const timezoneToCity = (tz: string) => {
  const map: Record<string, string> = {
    "Asia/Manila": "Manila",
    "America/New_York": "New York",
    "Europe/London": "London",
    "Asia/Tokyo": "Tokyo",
    "Australia/Sydney": "Sydney",
    "Asia/Seoul": "Seoul",
    "Asia/Shanghai": "Shanghai",
    "Europe/Paris": "Paris",
    "Europe/Madrid": "Madrid",
    "Europe/Rome": "Rome",
  };
  return map[tz] || tz.split('/')[1] || "Unknown";
};

export default function Document() {
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();
  const router = useRouter();

  const [content, setContent] = useState('');
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [createdTimezone, setCreatedTimezone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [docExists, setDocExists] = useState(false);
  const [timezoneSetting, setTimezoneSetting] = useState('Asia/Manila');
  const [showSeal, setShowSeal] = useState(false);

  const documentId = id as string;

  const fetchTimezoneSetting = async () => {
    try {
      const settingsRef = doc(db, 'settings', 'timezone');
      const snap = await getDoc(settingsRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.timezone) setTimezoneSetting(data.timezone);
      }
    } catch (error) {
      console.error('Error fetching timezone setting:', error);
    }
  };

  useEffect(() => {
    fetchTimezoneSetting();
  }, []);

  useEffect(() => {
    if (!documentId) return;

    const fetchDocument = async () => {
      try {
        const docRef = doc(db, 'documents', documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setContent(data.content || '');
          setCreatedAt(data.createdAt || null);
          setCreatedTimezone(data.createdTimezone || null);
          setDocExists(true);
        } else {
          await setDoc(doc(db, 'documents', documentId), {
            name: title || 'Untitled',
            content: '',
            createdAt: null,
            updatedAt: null,
            createdTimezone: null,
          });
          setDocExists(true);
        }
      } catch (error) {
        console.error('Error loading document:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId, title]);

  const formatTimestamp = (date: Date, tz: string) => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: tz,
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const handleTextChange = async (text: string) => {
    setContent(text);

    if (!createdAt && text.trim().length > 0) {
      const now = new Date();
      const formatted = formatTimestamp(now, timezoneSetting);
      setCreatedAt(formatted);
      setCreatedTimezone(timezoneSetting);

      try {
        const docRef = doc(db, 'documents', documentId);
        await updateDoc(docRef, {
          createdAt: formatted,
          createdTimezone: timezoneSetting,
        });
      } catch (error) {
        console.error('Error setting createdAt:', error);
      }
    }
  };

  const handleSave = async () => {
    if (!documentId) return;

    try {
      const now = new Date();
      const tz = createdTimezone || timezoneSetting;
      const formattedUpdated = formatTimestamp(now, tz);

      const docRef = doc(db, 'documents', documentId);
      await updateDoc(docRef, {
        name: title || 'Untitled',
        content,
        updatedAt: formattedUpdated,
      });

      setShowSeal(true);
      Alert.alert('Saved', 'Document saved successfully!');
    } catch (error) {
      console.error('Error saving document:', error);
      Alert.alert('Error', 'Failed to save document.');
    }
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{title || 'Untitled Document'}</Text>

      <View style={styles.boxWrapper}>
        {createdAt && <Text style={styles.timestampText}>{createdAt}</Text>}

        <TextInput
          style={styles.box}
          multiline
          textAlignVertical="top"
          value={content}
          onChangeText={handleTextChange}
        />

        {showSeal && createdTimezone && (
          <View style={styles.sealOverlay}>
            <Text style={styles.sealTextTop}>- seal -</Text>
            <Text style={styles.sealTextBottom}>
              {timezoneToCity(createdTimezone)}
            </Text>
          </View>
        )}
      </View>

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  boxWrapper: {
    flex: 1,
    position: 'relative',
  },
  timestampText: {
    position: 'absolute',
    top: 8,
    right: 12,
    fontSize: 12,
    color: '#666',
    zIndex: 10,
  },
  box: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    paddingTop: 28,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    textAlignVertical: 'top',
  },
  sealOverlay: {
    position: 'absolute',
    bottom: 30,
    right: 45,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(0,128,128,0.8)', 
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-30deg' }],
    opacity: 0.8,
    zIndex: 10,
  },
  sealTextTop: {
    fontSize: 16,
    color: 'white',
    fontStyle: 'italic',
  },
  sealTextBottom: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  saveButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  saveText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
