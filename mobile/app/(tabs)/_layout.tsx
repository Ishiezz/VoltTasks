import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius } from '../../theme/tokens';

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface TabIconProps {
  name: IoniconsName;
  focused: boolean;
  color: any;
}

const TabIcon = ({ name, focused, color }: TabIconProps) => (
  <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
    <Ionicons
      name={focused ? name : (`${name}-outline` as IoniconsName)}
      size={22}
      color={focused ? Colors.accentStart : color}
    />
  </View>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        ),
        tabBarActiveTintColor: Colors.accentStart,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="checkmark-circle" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="bar-chart" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="settings" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: 'transparent',
    elevation: 0,
    height: 84,
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  iconWrapActive: {
    backgroundColor: Colors.glowViolet,
  },
});
