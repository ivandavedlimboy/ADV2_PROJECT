import { auth, storage } from "@/config/firebase";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function Register() {
  const defaultImage = require("../../assets/images/no_profile.webp");
  const [image, setImage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { control, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;
      let photoURL = "";

      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();

        const imageRef = ref(storage, `profileImages/${user.uid}.jpg`);
        await uploadBytes(imageRef, blob);

        photoURL = await getDownloadURL(imageRef);
      }

      await updateProfile(user, {
        displayName: data.name,
        photoURL: photoURL,
      });

      setSuccessMessage("Registered successfully!");
      setErrorMessage(null);
      setTimeout(() => {
        setSuccessMessage(null);
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("Email already in use");
      } else {
        setErrorMessage("Registration failed. Please try again.");
      }
      console.error("Registration error:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>REGISTER</Text>
      <View style={styles.registerBox}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          <Image
            source={image ? { uri: image } : defaultImage}
            style={styles.image}
          />
        </TouchableOpacity>

        <Controller
          control={control}
          name="name"
          rules={{ required: "Name is required" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Name"
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.name && (
          <Text style={styles.errorText}>{(errors.name as any).message}</Text>
        )}

        <Controller
          control={control}
          name="email"
          rules={{
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+$/i,
              message: "Invalid email",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.email && (
          <Text style={styles.errorText}>{(errors.email as any).message}</Text>
        )}

        <Controller
          control={control}
          name="password"
          rules={{
            required: "Password is required",
            minLength: { value: 6, message: "Minimum 6 characters" },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && (
          <Text style={styles.errorText}>
            {(errors.password as any).message}
          </Text>
        )}

        {errorMessage && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        {successMessage && (
          <Text style={styles.successMessage}>{successMessage}</Text>
        )}

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonTextAlt}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 45,
    alignItems: "center",
    backgroundColor: "#F0F2F5",
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  registerBox: {
    backgroundColor: "#fff",
    width: 400,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
  },
  imagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  input: {
    height: 45,
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  registerButton: {
    backgroundColor: "teal",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  loginButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 5,
    borderColor: "teal",
    borderWidth: 1,
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  buttonTextAlt: {
    color: "teal",
    fontWeight: "bold",
  },
  errorText: {
    alignSelf: "flex-start",
    color: "red",
    marginBottom: 8,
    marginLeft: 5,
  },
  successMessage: {
    color: "green",
    fontWeight: "bold",
    marginBottom: 10,
  },
});