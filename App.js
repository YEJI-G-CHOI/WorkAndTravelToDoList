import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome6 } from '@expo/vector-icons';
import { theme } from './colors';

const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const work = () => setWorking(true);
  const travel = () => setWorking(false);
  const onChangeText = (payload) => setText(payload);

  const loadToDos = async () => {
    setIsLoading(true);

    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      data !== null ? setToDos(JSON.parse(data)) : null;
      setIsLoading(false);
    } catch (error) {
      console.log("loadToDos err", error);
      setIsLoading(false);
    }
  };

  const addToDo = async () => {
    // To Do가 비어있을 경우
    if (text === "") { return; }

    // save To Do
    const newToDos = { ...toDos, [Date.now()]: { text, working } };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  // storage에 To Do 저장
  const saveToDos = async (toDosData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toDosData));
    } catch (error) {
      console.log("saveToDos err", error);
    }

  };

  const deleteToDo = (toDoId) => {
    Alert.alert(
      "Delete To Do",
      "Are you sure?",
      [{ text: "Cancel" },
      {
        text: "I'm sure",
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[toDoId];
          setToDos(newToDos);
          await saveToDos(newToDos);
        },
      }
      ]
    );
  };

  useEffect(() => { loadToDos(); }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{ ...styles.btnText, color: working ? theme.red : theme.gray }}>Work</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={travel}>
          <Text style={{ ...styles.btnText, color: !working ? theme.red : theme.gray }}>Travel</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        value={text}
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        returnKeyType="done"
        autoComplete="country"
        style={styles.input} />

      <ScrollView>
        {
          isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator size={"large"} color={theme.green} />
            </View>
          ) : (
            Object.keys(toDos).length !== 0 ? (
              Object.keys(toDos).map((item) => (
                toDos[item].working === working ?
                  <View style={styles.toDo}>
                    <Text style={styles.toDoText}>{toDos[item].text}</Text>
                    <TouchableOpacity onPress={() => deleteToDo(item)}>
                      <FontAwesome6 name="trash-can" size={15} color={theme.background} />
                    </TouchableOpacity>
                  </View>
                  :
                  null
              ))
            ) : (
              <View></View>
            ))
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 20
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 100
  },
  btnText: {
    fontSize: 40,
    fontWeight: "600"
  },
  input: {
    marginVertical: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: theme.orange,
    fontSize: 15,
  },
  toDo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: theme.green,
  },
  toDoText: {
    color: theme.background,
    fontSize: 15,
    fontWeight: "500"
  },
  loading: {
    marginTop: 50
  }
});
