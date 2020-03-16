import AsyncStorage from '@react-native-community/async-storage';

export async function storeData(storage_Key , value){
    try {
        await AsyncStorage.setItem(storage_Key, value)
    } catch (e) {
        // saving error
        console.log('save error');
    }
}

export function getData (storage_Key){
    try {
        const value = AsyncStorage.getItem(storage_Key)
        if(value !== null) {
            // value previously stored
            return value;
        }
        return "";
    } catch(e) {
        // error reading value
        return "";
    }
}


