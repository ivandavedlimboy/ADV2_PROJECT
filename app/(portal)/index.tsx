import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.leftPane}>
        <View style={styles.titleContainer}>
          <Text style={styles.travelText}>TRAVEL</Text>
          <View style={styles.journalRow}>
            <Text style={styles.journalText}>J</Text>
            <Image
              source={require("../../assets/images/clock.jpg")}
              style={styles.clockImage}
            />
            <Text style={styles.journalText}>U</Text>
            <Text style={styles.journalText}>R</Text>
            <Text style={styles.journalText}>N</Text>
            <Text style={styles.journalText}>A</Text>
            <Text style={styles.journalText}>L</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => router.push("/(portal)/login")}
          >
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.registerButton]}
            onPress={() => router.push("/(portal)/register")}
          >
            <Text style={styles.registerText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ImageBackground
        source={require("../../assets/images/TJOUR.jpg")}
        style={styles.wallpaper}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F0F2F5",
  },
leftPane: {
  width: width * 0.75,
  justifyContent: "flex-start",  
  alignItems: "center",
  paddingTop: 20,              
},
  wallpaper: {
    width: width * 0.25,
    height: height,
  },
titleContainer: {
  marginBottom: 40,
  marginTop: 30,                  
  alignItems: "flex-start",
  marginLeft: 0,
},
  travelText: {
    marginTop: 0,
    fontSize: 80,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  journalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 200,
    marginTop: 10,
  },
  journalText: {
    fontSize: 80,
    fontWeight: "bold",
  },
  clockImage: {
    width: 75,
    height: 75,
    borderRadius: 45,
    marginHorizontal: 5,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "center",
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginHorizontal: 12,
  },
  loginButton: {
    backgroundColor: "teal",
  },
  registerButton: {
    backgroundColor: "#ffffff",
    borderColor: "teal",
    borderWidth: 2,
  },
  loginText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  registerText: {
    color: "teal",
    fontWeight: "bold",
    fontSize: 18,
  },
});
