import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Pressable,
  TextInput,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { db } from '@/config/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { useRouter } from 'expo-router';

export default function Select() {
  const router = useRouter();
  const [items, setItems] = useState<
    { key: string; name: string; selected: boolean }[]
  >([]);
  const [renameInput, setRenameInput] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'items'));
        const loadedItems = snapshot.docs.map(doc => ({
          key: doc.id,
          ...(doc.data() as { name: string; selected: boolean }),
        }));
        setItems(loadedItems);
        const selectedItem = loadedItems.find(item => item.selected);
        setRenameInput(selectedItem?.name || '');
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);

  const handleAdd = async () => {
    try {
      const docRef = await addDoc(collection(db, 'items'), {
        name: 'Untitled',
        selected: false,
      });
      setItems(prev => [
        ...prev,
        { key: docRef.id, name: 'Untitled', selected: false },
      ]);
    } catch (error) {
      console.error('Error adding document:', error);
    }
  };

  const handleToggle = async (key: string) => {
    try {
      const snapshot = await getDocs(collection(db, 'items'));
      const toggledItem = snapshot.docs.find(docSnap => docSnap.id === key);
      if (!toggledItem) return;
      const currentSelected = toggledItem.data().selected;
      const batchUpdates = snapshot.docs.map(docSnap => {
        const docRef = doc(db, 'items', docSnap.id);
        if (docSnap.id === key) {
          return updateDoc(docRef, { selected: !currentSelected });
        } else {
          return updateDoc(docRef, { selected: false });
        }
      });
      await Promise.all(batchUpdates);
      const updatedSnapshot = await getDocs(collection(db, 'items'));
      const updatedItems = updatedSnapshot.docs.map(doc => ({
        key: doc.id,
        ...(doc.data() as { name: string; selected: boolean }),
      }));
      setItems(updatedItems);
      const selectedItem = updatedItems.find(item => item.selected);
      setRenameInput(selectedItem?.name || '');
    } catch (error) {
      console.error('Error toggling selection:', error);
    }
  };

  const handleDelete = async () => {
    const selectedItems = items.filter(item => item.selected);
    try {
      for (const item of selectedItems) {
        const docRef = doc(db, 'items', item.key);
        await deleteDoc(docRef);
      }
      setItems(prev => prev.filter(item => !item.selected));
      setRenameInput('');
    } catch (error) {
      console.error('Error deleting items:', error);
    }
  };

  const handleRename = async () => {
    const selectedItem = items.find(item => item.selected);
    if (!selectedItem) return;

    try {
      const docRef = doc(db, 'items', selectedItem.key);
      await updateDoc(docRef, { name: renameInput });
      setItems(prev =>
        prev.map(item =>
          item.selected ? { ...item, name: renameInput } : item
        )
      );
    } catch (error) {
      console.error('Error renaming item:', error);
    }
  };

  const handleLongPress = (id: string, title: string) => {
    router.push(`/document?id=${id}&title=${encodeURIComponent(title)}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topControls}>
        <TextInput
          style={styles.renameInput}
          value={renameInput}
          onChangeText={setRenameInput}
          placeholder=""
          placeholderTextColor="#888"
        />
        <Pressable
          style={[styles.button, { backgroundColor: '#FFB300' }]}
          onPress={handleRename}
        >
          <Text style={styles.buttonText}>Rename</Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: '#F44336' }]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {items.map(item => (
          <TouchableOpacity
            key={item.key}
            onPress={() => handleToggle(item.key)}
            onLongPress={() => {
              if (item.selected) {
                handleLongPress(item.key, item.name);
              }
            }}
          >
            <View style={[styles.item, item.selected && styles.selected]}>
              <Text style={styles.text}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.addButtonContainer}>
        <Pressable style={styles.addButton} onPress={handleAdd}>
          <MaterialIcons name="add" size={30} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 20,
    paddingHorizontal: 25,
  },
  item: {
    marginTop: 10,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'teal',
  },
  selected: {
    backgroundColor: '#007AFF',
  },
  text: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 10,
    gap: 10,
  },
  renameInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    color: 'black',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButtonContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
});
