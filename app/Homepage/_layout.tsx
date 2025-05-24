import { Tabs } from "expo-router";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


export default function Layout() {


    return(
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen
            name="journal"
            options={{
                title: "JOURNAL",
                tabBarIcon: ({ color }) =>
                    <MaterialIcons size={(28)} name="description" color={color}/>
            }}
            />
            <Tabs.Screen
            name="clock"
            options={{
                title: "CLOCK",
                tabBarIcon: ({ color }) =>
                    <MaterialIcons size={(28)} name="access-time" color={color}/>
            }}
            />
        </Tabs>
    )
}