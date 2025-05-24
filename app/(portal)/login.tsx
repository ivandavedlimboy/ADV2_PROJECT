import { auth, db } from "@/config/firebase";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Login() {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = (data: any) => {
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        await setDoc(doc(db, "loggedInUsers", user.uid), {
          email: user.email,
          name: user.displayName || "",
          loggedAt: new Date().toISOString(),
        });

        setSuccessMessage("Logged in successfully!");
        setErrorMessage(null);
        setTimeout(() => {
          setSuccessMessage(null);
          router.replace("/Homepage/journal");
        }, 2000);
      })
      .catch((error) => {
        if (error.code === "auth/invalid-credential") {
          setErrorMessage("Invalid email or password.");
        } else {
          setErrorMessage("Login failed. Please try again.");
        }
        setSuccessMessage(null);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>LOG-IN</Text>
      <View style={styles.loginBox}>
        <Text style={styles.title}>ADVL_EXERCISE PORTAL</Text>

        <Controller
          control={control}
          name="email"
          rules={{
            required: "Email is required",
            pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }
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
          rules={{ required: "Password is required" }}
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
          <Text style={styles.errorText}>{(errors.password as any).message}</Text>
        )}

        {successMessage && <Text style={styles.successMessage}>{successMessage}</Text>}
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        <TouchableOpacity style={styles.loginButton} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerButton} onPress={() => router.push("/register")}>
          <Text style={styles.registerText}>Register</Text>
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
  title: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 18,
  },
  loginBox: {
    backgroundColor: "#fff",
    width: 400,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
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
  loginButton: {
    backgroundColor: "teal",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  registerButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 5,
    borderColor: "teal",
    borderWidth: 1,
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
  },
  registerText: {
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
