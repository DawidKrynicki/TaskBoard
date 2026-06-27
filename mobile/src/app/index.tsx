import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const API_URL = 'https://taskboard-dawid.onrender.com';

export default function App() {
  const [screen, setScreen] = useState('LOGIN'); // Ekrany: LOGIN, TASKS, LOCATION
  const [token, setToken] = useState(null);
  const [tasks, setTasks] = useState([]);
  
  // Stany logowania
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Stany dodawania zadania
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  // Stan lokalizacji
  const [location, setLocation] = useState(null);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    const storedToken = await AsyncStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setScreen('TASKS');
      fetchTasks(storedToken);
    }
  };

  const handleLogin = async () => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const res = await fetch(`${API_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });
      if (res.ok) {
        const data = await res.json();
        await AsyncStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setScreen('TASKS');
        fetchTasks(data.access_token);
      } else {
        Alert.alert('Błąd', 'Błędne dane logowania');
      }
    } catch (e) {
      Alert.alert('Błąd', 'Brak połączenia z serwerem');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setScreen('LOGIN');
  };

  const fetchTasks = async (currentToken) => {
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      } else if (res.status === 401) {
        handleLogout(); 
      }
    } catch (e) {
      console.log(e);
    }
  };

  // --- NOWE: Dodawanie zadania ---
  const addTask = async () => {
    if (!newTaskTitle) {
      Alert.alert('Błąd', 'Tytuł zadania jest wymagany!');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTaskTitle, description: newTaskDesc, status: 'To Do' })
      });
      if (res.ok) {
        setNewTaskTitle('');
        setNewTaskDesc('');
        fetchTasks(token); // Odśwież listę
      }
    } catch (e) {
      Alert.alert('Błąd', 'Nie udało się dodać zadania');
    }
  };

  // --- NOWE: Usuwanie zadania ---
  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchTasks(token); // Odśwież listę
    } catch (e) {
      Alert.alert('Błąd', 'Nie udało się usunąć zadania');
    }
  };

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Błąd', 'Odmówiono dostępu do lokalizacji');
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
  };

  // --- EKRAN LOGOWANIA ---
  if (screen === 'LOGIN') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Zaloguj się do TaskBoard</Text>
        <TextInput style={styles.input} placeholder="Login (admin)" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Hasło (haslo123)" value={password} onChangeText={setPassword} secureTextEntry />
        <View style={{ marginTop: 10 }}>
          <Button title="Zaloguj" onPress={handleLogin} />
        </View>
      </View>
    );
  }

  // --- EKRAN LOKALIZACJI ---
  if (screen === 'LOCATION') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Twoja Pozycja GPS</Text>
        <Button title="Pobierz koordynaty" onPress={getLocation} />
        {location && (
          <Text style={{ marginTop: 20, fontSize: 16, textAlign: 'center' }}>
            Szerokość: {location.latitude}{'\n'}Długość: {location.longitude}
          </Text>
        )}
        <View style={{ marginTop: 40 }}>
          <Button title="Wróć do zadań" onPress={() => setScreen('TASKS')} color="gray" />
        </View>
      </View>
    );
  }

  // --- EKRAN GŁÓWNY (Zadania) ---
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Twoje Zadania</Text>
      
      <View style={styles.nav}>
        <Button title="Moduł GPS" onPress={() => setScreen('LOCATION')} />
        <Button title="Wyloguj" onPress={handleLogout} color="red" />
      </View>

      {/* Formularz dodawania zadania */}
      <View style={styles.addSection}>
        <TextInput style={styles.input} placeholder="Tytuł zadania..." value={newTaskTitle} onChangeText={setNewTaskTitle} />
        <TextInput style={styles.input} placeholder="Opis (opcjonalnie)..." value={newTaskDesc} onChangeText={setNewTaskDesc} />
        <Button title="Dodaj zadanie" onPress={addTask} color="#28a745" />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={{ color: '#666' }}>{item.description}</Text>
              <Text style={{ marginTop: 5, fontWeight: 'bold', color: '#0056b3' }}>Status: {item.status}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteBtn}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Usuń</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#f4f6f8' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 8, backgroundColor: 'white' },
  addSection: { marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'white', marginBottom: 10, borderRadius: 8, elevation: 3 },
  cardTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 5 },
  nav: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  deleteBtn: { backgroundColor: '#ff4d4d', padding: 10, borderRadius: 8, marginLeft: 10 }
});