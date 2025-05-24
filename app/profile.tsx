import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { auth, db } from "@/config/firebase";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { doc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function Profile() {
  const [userName, setUserName] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState<string | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName);
      setTempName(user.displayName);
      setUserImage(user.photoURL);
      setTempImage(user.photoURL);

      setDoc(doc(db, "activeUser", "current"), {
        email: user.email,
        name: user.displayName ?? "",
      }).catch((err) => console.error("activeUser error:", err));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Allow access to your photos to pick an image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setTempImage(result.assets[0].uri);
    }
  };

  const handleUpdateSave = async () => {
    if (editing) {
      setUserName(tempName);
      setUserImage(tempImage);
      Alert.alert("Profile Updated!");

      const user = auth.currentUser;
      if (user) {
        try {
          
          await addDoc(collection(db, "userUpdates"), {
            email: user.email,
            updatedName: tempName ?? "",
          });
        } catch (error) {
          console.error("userUpdates error:", error);
        }
      }
    }
    setEditing(!editing);
  };

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <TouchableOpacity
          disabled={!editing}
          onPress={pickImage}
          activeOpacity={0.7}
        >
          <Image
            source={
              tempImage
                ? { uri: tempImage }
                : require("../assets/images/no_profile.webp")
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>

        {editing ? (
          <TextInput
            style={styles.editableName}
            value={tempName || ""}
            onChangeText={setTempName}
            placeholder="Enter your name"
          />
        ) : (
          <Text style={styles.userName}>{userName || "No name available"}</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.updateButton, editing && styles.updateButtonActive]}
        onPress={handleUpdateSave}
      >
        <Text
          style={[
            styles.updateButtonText,
            editing && styles.updateButtonTextActive,
          ]}
        >
          {editing ? "Save" : "Update"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 180,
    height: 180,
    borderRadius: 100,
    marginBottom: 24,
    resizeMode: "cover",
  },
  userName: {
    fontSize: 25,
    fontWeight: "bold",
  },
  editableName: {
    fontSize: 25,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "teal",
    paddingVertical: 6,
    minWidth: 220,
    textAlign: "center",
  },
  updateButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "teal",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 5,
    width: 200,
    alignItems: "center",
    marginBottom: 16,
  },
  updateButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  updateButtonText: {
    fontSize: 20,
    color: "teal",
    fontWeight: "bold",
  },
  updateButtonTextActive: {
    color: "white",
  },
  logoutButton: {
    backgroundColor: "teal",
    padding: 12,
    borderRadius: 5,
    width: 200,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
});
