import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";

const timezones = [
  "Asia/Manila",
  "America/New_York",
  "Europe/London",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Europe/Paris",
  "Europe/Madrid",
  "Europe/Rome",
];

export default function Clock() {
  const [time, setTime] = useState(new Date());
  const [timezone, setTimezone] = useState("Asia/Manila");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "timezone"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTimezone(data.timezone || "Asia/Manila");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateTimezone = async (newTz: string) => {
    setTimezone(newTz);
    try {
      await setDoc(doc(db, "settings", "timezone"), { timezone: newTz });
    } catch (error) {
      console.error("Error saving timezone:", error);
    }
  };

  const getTimeParts = () => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };

    const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(time);
    const hour = parts.find((p) => p.type === "hour")?.value || "00";
    const minute = parts.find((p) => p.type === "minute")?.value || "00";
    const second = parts.find((p) => p.type === "second")?.value || "00";
    const ampm = parts.find((p) => p.type === "dayPeriod")?.value || "AM";

    return { hour, minute, second, ampm };
  };

  const getDateParts = () => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    };

    const formatted = new Intl.DateTimeFormat("en-US", options).format(time);
    const date = new Date(
      new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).format(time)
    );

    const month = date.toLocaleString("en-US", {
      timeZone: timezone,
      month: "long",
    });

    const day = date.getDate();

    return { month, day };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const { hour, minute, second, ampm } = getTimeParts();
  const { month, day } = getDateParts();

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.calendarBox}>
          <Text style={styles.calendarMonth}>{month}</Text>
          <Text style={styles.calendarDay}>{day}</Text>
        </View>

        <View style={styles.timerContainer}>
          <Text style={styles.timeBox}>{hour}</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.timeBox}>{minute}</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.timeBox}>{second}</Text>
          <Text style={styles.separator}>:</Text>
          <Text style={styles.timeBox}>{ampm}</Text>
        </View>

        <Text style={styles.heading}>SELECT TIMEZONE:</Text>
        <Picker
          selectedValue={timezone}
          style={styles.picker}
          onValueChange={updateTimezone}
          mode="dropdown"
        >
          {timezones.map((tz) => (
            <Picker.Item key={tz} label={tz} value={tz} />
          ))}
        </Picker>

        <View style={{ height: 200 }} />
      </View>
    </ScrollView>
  );
}

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    paddingTop: 30,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    flexGrow: 1,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#003d3d",
    textTransform: "uppercase",
  },
  picker: {
    height: 50,
    width: 250,
    marginBottom: 10,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  timeBox: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#003d3d",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: screenWidth < 350 ? 60 : 80,
    textAlign: "center",
    marginHorizontal: 5,
  },
  separator: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#003d3d",
  },
  calendarBox: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#003d3d",
    borderRadius: 10,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    overflow: "hidden",
    padding: 0,
    margin: 0,
    width: 104,
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003d3d",
    backgroundColor: "white",
    width: "100%",
    textAlign: "center",
    paddingVertical: 6,
  },
  calendarDay: {
    fontSize: 42,
    fontWeight: "bold",
    color: "white",
    paddingVertical: 12,
    paddingHorizontal: 20,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  loadingText: {
    fontSize: 18,
    color: "#003d3d",
    fontWeight: "bold",
  },
});
